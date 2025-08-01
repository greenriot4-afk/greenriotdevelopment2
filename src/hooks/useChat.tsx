import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  read_at: string | null;
  created_at: string;
  sender?: {
    display_name: string;
    username: string;
  };
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  other_participant?: {
    display_name: string;
    username: string;
  };
  last_message?: Message;
  unread_count?: number;
}

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages!messages_conversation_id_fkey (
            id,
            content,
            message_type,
            sender_id,
            created_at,
            read_at
          )
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get other participants' profiles
      const participantIds = data?.flatMap(conv => 
        [conv.participant_1, conv.participant_2].filter(id => id !== user.id)
      ) || [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', participantIds);

      if (profilesError) throw profilesError;

      const conversationsWithDetails = data?.map(conv => {
        const otherParticipantId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
        const otherParticipant = profiles?.find(p => p.user_id === otherParticipantId);
        
        // Get the latest message
        const lastMessage = conv.messages?.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        // Count unread messages
        const unreadCount = conv.messages?.filter((msg: any) => 
          msg.sender_id !== user.id && !msg.read_at
        ).length || 0;

        return {
          id: conv.id,
          participant_1: conv.participant_1,
          participant_2: conv.participant_2,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          other_participant: otherParticipant ? {
            display_name: otherParticipant.display_name,
            username: otherParticipant.username
          } : undefined,
          last_message: lastMessage ? {
            id: lastMessage.id,
            conversation_id: conv.id,
            sender_id: lastMessage.sender_id,
            content: lastMessage.content,
            message_type: lastMessage.message_type || 'text',
            read_at: lastMessage.read_at,
            created_at: lastMessage.created_at
          } : undefined,
          unread_count: unreadCount
        } as Conversation;
      }) || [];

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Error al cargar las conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const createOrGetConversation = async (otherUserId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existing, error: existingError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: otherUserId
        })
        .select('id')
        .single();

      if (createError) throw createError;

      return newConv.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Error al crear la conversación');
      return null;
    }
  };

  const sendMessage = async (conversationId: string, content: string, messageType: string = 'text'): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
      return false;
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Set up real-time subscription for conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(participant_1.eq.${user.id},participant_2.eq.${user.id})`
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    conversations,
    loading,
    createOrGetConversation,
    sendMessage,
    markMessagesAsRead,
    fetchConversations
  };
};