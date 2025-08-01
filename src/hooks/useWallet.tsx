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
          p_object_type: sanitizedObjectType
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
      };

      // Update local state with new balance
      setWallet(prev => prev ? { ...prev, balance: parseFloat(walletResult.new_balance.toString()) } : null);
      
      return { 
        success: true, 
        transaction_id: walletResult.transaction_id,
        previous_balance: walletResult.previous_balance,
        new_balance: walletResult.new_balance
      };
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