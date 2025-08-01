import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthAction } from '@/hooks/useAuthAction';

interface ChatButtonProps {
  userId: string;
  username?: string;
  size?: 'sm' | 'default';
  variant?: 'default' | 'outline' | 'ghost';
  requireAuth?: boolean;
}

export const ChatButton = ({ userId, username, size = 'sm', variant = 'outline', requireAuth = false }: ChatButtonProps) => {
  const { user } = useAuth();
  const { createOrGetConversation } = useChat();
  const navigate = useNavigate();
  const { requireAuth: authAction } = useAuthAction();

  const handleChatClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (requireAuth && !user) {
      authAction(() => {}, 'Debes crear una cuenta para chatear');
      return;
    }

    if (!user) {
      toast.error('Debes iniciar sesión para chatear');
      return;
    }

    if (user.id === userId) {
      toast.error('No puedes chatear contigo mismo');
      return;
    }

    try {
      const conversationId = await createOrGetConversation(userId);
      if (conversationId) {
        navigate(`/chat/${conversationId}`);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Error al abrir el chat');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleChatClick}
      className="flex items-center gap-2"
    >
      <MessageCircle className="w-3 h-3" />
      {username ? `Chat con ${username}` : 'Chat'}
    </Button>
  );
};