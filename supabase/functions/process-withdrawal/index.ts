import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WithdrawalRequest {
  amount: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    console.log('Processing withdrawal request for user:', user.id);

    // Parse request body
    const { amount }: WithdrawalRequest = await req.json();

    // Validate amount (minimum $10)
    if (!amount || amount < 10) {
      throw new Error('Minimum withdrawal amount is $10');
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError) {
      throw new Error('Wallet not found');
    }

    // Check if user has sufficient balance
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Start a transaction to update wallet balance and create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        wallet_id: wallet.id,
        type: 'withdrawal',
        amount: amount,
        status: 'completed', // For this demo, we'll mark as completed immediately
        description: `Withdrawal of $${amount}`
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error('Failed to create transaction: ' + transactionError.message);
    }

    // Update wallet balance
    const newBalance = (parseFloat(wallet.balance) - amount).toFixed(2);
    const { error: updateError } = await supabaseClient
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', wallet.id);

    if (updateError) {
      // If wallet update fails, we should mark the transaction as failed
      await supabaseClient
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);
      
      throw new Error('Failed to update wallet balance');
    }

    console.log('Withdrawal processed successfully:', transaction.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction_id: transaction.id,
        new_balance: newBalance
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error processing withdrawal:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});