import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UserComment {
  id: string;
  user_id: string;
  target_user_id: string;
  content: string;
  created_at: string;
  display_name?: string;
  username?: string;
}

export const useUserComments = (targetUserId?: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      const { data: commentsData, error } = await supabase
        .from('user_comments')
        .select('*')
        .eq('target_user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile data for each comment
      const enrichedComments = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', comment.user_id)
            .single();

          return {
            ...comment,
            display_name: profile?.display_name || 'Usuario',
            username: profile?.username || ''
          };
        })
      );

      setComments(enrichedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!user || !targetUserId) {
      toast.error('Debes estar logueado para comentar');
      return false;
    }

    if (user.id === targetUserId) {
      toast.error('No puedes comentar en tu propio perfil');
      return false;
    }

    if (!content.trim()) {
      toast.error('El comentario no puede estar vacío');
      return false;
    }

    setSubmitting(true);
    try {
      // Check if user already has a comment for this user
      const { data: existingComment } = await supabase
        .from('user_comments')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_user_id', targetUserId)
        .single();

      if (existingComment) {
        // Update existing comment
        const { error } = await supabase
          .from('user_comments')
          .update({ content: content.trim() })
          .eq('id', existingComment.id);

        if (error) throw error;
        toast.success('Comentario actualizado');
      } else {
        // Create new comment
        const { error } = await supabase
          .from('user_comments')
          .insert({
            user_id: user.id,
            target_user_id: targetUserId,
            content: content.trim()
          });

        if (error) throw error;
        toast.success('Comentario añadido');
      }

      await fetchComments();
      return true;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Error al añadir comentario');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('Comentario eliminado');
      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error al eliminar comentario');
    }
  };

  const getUserComment = () => {
    return comments.find(comment => comment.user_id === user?.id);
  };

  useEffect(() => {
    fetchComments();
  }, [targetUserId]);

  return {
    comments,
    loading,
    submitting,
    addComment,
    deleteComment,
    getUserComment,
    refetch: fetchComments
  };
};