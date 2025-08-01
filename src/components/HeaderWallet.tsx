import { WalletIcon } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HeaderWallet = () => {
  const { wallet, loading } = useWallet();
  const navigate = useNavigate();

  const handleWalletClick = () => {
    navigate('/wallet');
  };

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

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleWalletClick}
      className="h-8 px-2 text-white hover:bg-white/10 flex items-center gap-1"
    >
      <WalletIcon className="h-4 w-4" />
      <span className="text-sm font-medium">
        ${wallet?.balance?.toFixed(0) || '0'}
      </span>
    </Button>
  );
};