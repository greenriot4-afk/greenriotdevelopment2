import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type Currency = 'USD' | 'EUR';

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

interface WalletContextValue {
  wallets: Record<Currency, Wallet | null>;
  selectedCurrency: Currency;
  loading: boolean;
  fetchWallets: () => Promise<void>;
  deductBalance: (amount: number, description: string, objectType?: string, currency?: Currency) => Promise<any>;
  hasEnoughBalance: (amount: number, currency?: Currency) => boolean;
  switchCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number, currency?: Currency) => string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Record<Currency, Wallet | null>>({
    USD: null,
    EUR: null
  });
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [loading, setLoading] = useState(true);

  const fetchWallets = async () => {
    if (!user) {
      setWallets({ USD: null, EUR: null });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get fresh session to avoid auth errors
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setWallets({ USD: null, EUR: null });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wallets:', error);
        // For auth errors, don't throw - just set wallets to null
        if (error.code === 'refresh_token_not_found' || error.message?.includes('refresh')) {
          setWallets({ USD: null, EUR: null });
          return;
        }
        throw error;
      }

      // Initialize wallets object
      const walletsData: Record<Currency, Wallet | null> = {
        USD: null,
        EUR: null
      };

      // Map the fetched wallets by currency
      if (data) {
        data.forEach(walletData => {
          if (walletData.currency === 'USD' || walletData.currency === 'EUR') {
            const wallet: Wallet = {
              ...walletData,
              currency: walletData.currency as Currency
            };
            walletsData[wallet.currency] = wallet;
          }
        });
      }

      setWallets(walletsData);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      // Don't show toast error for wallet fetch failures - just log them
      setWallets({ USD: null, EUR: null });
    } finally {
      setLoading(false);
    }
  };

  const deductBalance = async (amount: number, description: string, objectType: string = 'abandoned', currency: Currency = selectedCurrency) => {
    if (!user) {
      throw new Error('Usuario no disponible');
    }

    const wallet = wallets[currency];
    if (!wallet) {
      throw new Error(`Wallet de ${currency} no disponible`);
    }

    // Input validation
    if (!amount || amount <= 0 || amount > 1000000) {
      throw new Error('Cantidad inválida');
    }

    if (wallet.balance < amount) {
      throw new Error('Saldo insuficiente');
    }

    // Sanitize description
    const sanitizedDescription = description?.replace(/[<>'"&]/g, '').slice(0, 500) || 'Deducción de saldo';
    const sanitizedObjectType = objectType?.replace(/[<>'"&]/g, '').slice(0, 50) || 'abandoned';

    try {
      // Use atomic wallet update function to prevent race conditions
      const { data: result, error: atomicError } = await supabase
        .rpc('update_wallet_balance_atomic', {
          p_wallet_id: wallet.id,
          p_amount: amount,
          p_transaction_type: 'debit',
          p_user_id: user.id,
          p_description: sanitizedDescription,
          p_object_type: sanitizedObjectType,
          p_currency: currency
        });

      if (atomicError) {
        console.error('Error in atomic wallet update:', atomicError);
        throw new Error(atomicError.message || 'Error al procesar transacción');
      }

      // Type assertion for the RPC result
      const walletResult = result as {
        success: boolean;
        transaction_id: string;
        previous_balance: number;
        new_balance: number;
        currency: string;
      };

      // Update local state with new balance
      setWallets(prev => ({
        ...prev,
        [currency]: prev[currency] ? { 
          ...prev[currency]!, 
          balance: parseFloat(walletResult.new_balance.toString()) 
        } : null
      }));
      
      return { 
        success: true, 
        transaction_id: walletResult.transaction_id,
        previous_balance: walletResult.previous_balance,
        new_balance: walletResult.new_balance,
        currency: walletResult.currency
      };
    } catch (error) {
      console.error('Error deducting balance:', error);
      throw error;
    }
  };

  const hasEnoughBalance = (amount: number, currency: Currency = selectedCurrency): boolean => {
    const wallet = wallets[currency];
    return wallet ? wallet.balance >= amount : false;
  };

  const switchCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  const formatCurrency = (amount: number, currency: Currency = selectedCurrency): string => {
    const currencySymbols: Record<Currency, string> = {
      USD: '$',
      EUR: '€'
    };
    
    return `${currencySymbols[currency]}${amount.toFixed(2)}`;
  };

  useEffect(() => {
    fetchWallets();
  }, [user]);

  // Auto-refresh wallets when user session changes or every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchWallets();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  return {
    wallets,
    selectedCurrency,
    loading,
    fetchWallets,
    deductBalance,
    hasEnoughBalance,
    switchCurrency,
    formatCurrency,
    // Backward compatibility
    wallet: wallets[selectedCurrency],
    fetchWallet: fetchWallets
  };
};