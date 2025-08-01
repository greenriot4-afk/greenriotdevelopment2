import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UserLike {
  id: string;
  user_id: string;
  target_user_id: string;
  like_type: 'like' | 'dislike';
  created_at: string;
}

export interface UserLikeStats {
  likes: number;
  dislikes: number;
  userLike?: UserLike;
}

export const useUserLikes = (targetUserId?: string) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserLikeStats>({ likes: 0, dislikes: 0 });
  const [loading, setLoading] = useState(false);

  const fetchLikeStats = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      // Get all likes for the target user
      const { data: allLikes, error } = await supabase
        .from('user_likes')
        .select('*')
        .eq('target_user_id', targetUserId);

      if (error) throw error;

      const likes = allLikes?.filter(like => like.like_type === 'like').length || 0;
      const dislikes = allLikes?.filter(like => like.like_type === 'dislike').length || 0;
      
      // Check if current user has liked this user
      const userLike = allLikes?.find(like => like.user_id === user?.id) as UserLike | undefined;

      setStats({ likes, dislikes, userLike });
    } catch (error) {
      console.error('Error fetching like stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (likeType: 'like' | 'dislike') => {
    if (!user || !targetUserId) {
      toast.error('Debes estar logueado para dar likes');
      return;
    }

    if (user.id === targetUserId) {
      toast.error('No puedes darte like a ti mismo');
      return;
    }

    setLoading(true);
    try {
      // Check if user has already liked this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: recentLikes } = await supabase
        .from('user_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_user_id', targetUserId)
        .gte('created_at', oneWeekAgo.toISOString());

      if (recentLikes && recentLikes.length > 0) {
        // Update existing like
        const existingLike = recentLikes[0];
        if (existingLike.like_type === likeType) {
          // Remove like if clicking the same type
          const { error } = await supabase
            .from('user_likes')
            .delete()
            .eq('id', existingLike.id);

          if (error) throw error;
          toast.success('Like eliminado');
        } else {
          // Update to different type
          const { error } = await supabase
            .from('user_likes')
            .update({ like_type: likeType })
            .eq('id', existingLike.id);

          if (error) throw error;
          toast.success(`${likeType === 'like' ? 'Like' : 'Dislike'} actualizado`);
        }
      } else {
        // Create new like
        const { error } = await supabase
          .from('user_likes')
          .insert({
            user_id: user.id,
            target_user_id: targetUserId,
            like_type: likeType
          });

        if (error) throw error;
        toast.success(`${likeType === 'like' ? 'Like' : 'Dislike'} añadido`);
      }

      await fetchLikeStats();
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Error al procesar el like');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikeStats();
  }, [targetUserId, user]);

  return {
    stats,
    loading,
    toggleLike,
    refetch: fetchLikeStats
  };
};