import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChat, Message } from '@/hooks/useChat';
import { ImageUpload } from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const { sendMessage, markMessagesAsRead } = useChat();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversationId || !user) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        // Fetch conversation details and verify user access
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (convError) throw convError;

        if (conversation.participant_1 !== user.id && conversation.participant_2 !== user.id) {
          toast.error('No tienes acceso a esta conversación');
          navigate('/');
          return;
        }

        // Get other participant info
        const otherUserId = conversation.participant_1 === user.id ? 
          conversation.participant_2 : conversation.participant_1;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('user_id', otherUserId)
          .single();

        if (profileError) throw profileError;
        setOtherParticipant(profile);

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        // Get sender profiles for messages
        const senderIds = [...new Set(messagesData?.map(msg => msg.sender_id) || [])];
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, username')
          .in('user_id', senderIds);

        const formattedMessages = messagesData?.map(msg => ({
          ...msg,
          sender: senderProfiles?.find(p => p.user_id === msg.sender_id) ? {
            display_name: senderProfiles.find(p => p.user_id === msg.sender_id)!.display_name,
            username: senderProfiles.find(p => p.user_id === msg.sender_id)!.username
          } : undefined
        })) || [];

        setMessages(formattedMessages);

        // Mark messages as read
        await markMessagesAsRead(conversationId);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Error al cargar los mensajes');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, user]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Get sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', newMessage.sender_id)
            .single();

          const messageWithSender = {
            ...newMessage,
            sender: profile ? {
              display_name: profile.display_name,
              username: profile.username
            } : undefined
          };

          setMessages(prev => [...prev, messageWithSender]);
          
          // Mark as read if not from current user
          if (newMessage.sender_id !== user?.id) {
            await markMessagesAsRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending || !conversationId) return;

    try {
      setSending(true);
      const success = await sendMessage(conversationId, newMessage, 'text');
      
      if (success) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImageUploaded = async (imageUrl: string) => {
    if (!conversationId) return;

    try {
      setSending(true);
      await sendMessage(conversationId, imageUrl, 'image');
    } catch (error) {
      console.error('Error sending image:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="text-center py-8">Cargando chat...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/chat')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{otherParticipant?.display_name || 'Usuario'}</p>
            <p className="text-xs text-muted-foreground">
              @{otherParticipant?.username || 'usuario'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Inicia la conversación enviando el primer mensaje
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="p-3">
                  {message.message_type === 'image' ? (
                    <img 
                      src={message.content} 
                      alt="Imagen enviada"
                      className="max-w-full h-auto rounded-lg cursor-pointer"
                      onClick={() => window.open(message.content, '_blank')}
                    />
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id === user?.id
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </p>
                </div>
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <ImageUpload 
            onImageUploaded={handleImageUploaded}
            disabled={sending}
          />
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;