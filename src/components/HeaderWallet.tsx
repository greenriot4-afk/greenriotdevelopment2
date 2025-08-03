import { WalletIcon } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { useAuthAction } from '@/hooks/useAuthAction';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HeaderWallet = () => {
  const { wallets, selectedCurrency, loading, formatCurrency } = useWallet();
  const { user } = useAuth();
  const { requireAuth } = useAuthAction();
  const navigate = useNavigate();

  const handleWalletClick = () => {
    requireAuth(() => {
      navigate('/wallet');
    });
  };

  // Don't show wallet for non-authenticated users
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-white hover:bg-white/10"
      >
        <WalletIcon className="h-4 w-4" />
      </Button>
    );
  }

  const currentWallet = wallets[selectedCurrency];
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleWalletClick}
      className="h-8 px-2 text-white hover:bg-white/10 flex items-center gap-1"
    >
      <WalletIcon className="h-4 w-4" />
      <span className="text-sm font-medium">
        {formatCurrency(currentWallet?.balance || 0, selectedCurrency)}
      </span>
    </Button>
  );
};