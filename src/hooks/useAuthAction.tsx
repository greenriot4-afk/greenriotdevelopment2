import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuthAction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const requireAuth = (action: () => void, message = 'Debes iniciar sesión para usar esta función') => {
    if (!user) {
      toast.error(message);
      navigate('/auth');
      return;
    }
    action();
  };

  const requireAuthAsync = async (action: () => Promise<void>, message = 'Debes iniciar sesión para usar esta función') => {
    if (!user) {
      toast.error(message);
      navigate('/auth');
      return;
    }
    await action();
  };

  return { requireAuth, requireAuthAsync, isAuthenticated: !!user };
};