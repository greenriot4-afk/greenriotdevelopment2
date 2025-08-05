import Wallet from '@/components/Wallet';
import { ProcessCommissionButton } from '@/components/ProcessCommissionButton';

const WalletPage = () => {
  return (
    <div className="flex-1 p-4 space-y-4">
      <ProcessCommissionButton />
      <Wallet />
    </div>
  );
};

export default WalletPage;