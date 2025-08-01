import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    if (!user) {
      setWallet(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Error al cargar el wallet');
    } finally {
      setLoading(false);
    }
  };

  const deductBalance = async (amount: number, description: string, objectType: string = 'abandoned') => {
    if (!user || !wallet) {
      throw new Error('Usuario o wallet no disponible');
    }

    if (wallet.balance < amount) {
      throw new Error('Saldo insuficiente');
    }

    try {
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_id: wallet.id,
          type: 'debit',
          amount: -amount, // Negative for debit
          status: 'completed',
          description,
          object_type: objectType
        });

      if (transactionError) throw transactionError;

      // Update wallet balance
      const newBalance = wallet.balance - amount;
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      // Update local state
      setWallet(prev => prev ? { ...prev, balance: newBalance } : null);
      
      return { success: true };
    } catch (error) {
      console.error('Error deducting balance:', error);
      throw error;
    }
  };

  const hasEnoughBalance = (amount: number): boolean => {
    return wallet ? wallet.balance >= amount : false;
  };

  useEffect(() => {
    fetchWallet();
  }, [user]);

  return {
    wallet,
    loading,
    fetchWallet,
    deductBalance,
    hasEnoughBalance
  };
};