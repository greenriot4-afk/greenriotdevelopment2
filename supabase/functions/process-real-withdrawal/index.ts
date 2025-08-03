import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Starting real withdrawal process ===');
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User authentication failed');
    }

    const requestBody = await req.json();
    const { amount } = requestBody;

    if (!amount || amount <= 0) {
      throw new Error('Invalid withdrawal amount');
    }

    console.log('Processing withdrawal:', { userId: user.id, amount });

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      throw new Error('Wallet not found');
    }

    // Check sufficient balance
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Get user's connected account
    const { data: connectedAccount, error: accountError } = await supabaseClient
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (accountError || !connectedAccount) {
      throw new Error('No connected account found. Please set up your payout account first.');
    }

    if (connectedAccount.account_status !== 'active') {
      throw new Error('Your payout account is not active. Please complete the verification process.');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Verify account is still active on Stripe
    const account = await stripe.accounts.retrieve(connectedAccount.stripe_account_id);
    if (!account.charges_enabled || !account.payouts_enabled) {
      throw new Error('Your payout account is restricted. Please check your Stripe dashboard.');
    }

    // Convert amount to cents
    const amountCents = Math.round(amount * 100);

    // Create transfer to connected account
    console.log('Creating Stripe transfer:', { accountId: connectedAccount.stripe_account_id, amountCents });
    
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: 'usd',
      destination: connectedAccount.stripe_account_id,
      description: `Withdrawal for user ${user.id}`,
      metadata: {
        user_id: user.id,
        wallet_id: wallet.id,
        withdrawal_amount: amount.toString()
      }
    });

    console.log('Transfer created:', transfer.id);

    // Update wallet balance atomically
    const { data: transactionResult, error: transactionError } = await supabaseClient
      .rpc('update_wallet_balance_atomic', {
        p_wallet_id: wallet.id,
        p_amount: amount,
        p_transaction_type: 'withdrawal',
        p_user_id: user.id,
        p_description: `Real withdrawal via Stripe - Transfer ID: ${transfer.id}`,
        p_object_type: 'withdrawal'
      });

    if (transactionError) {
      console.error('Failed to update wallet:', transactionError);
      // In a production system, you'd want to implement a rollback mechanism here
      throw new Error('Failed to process withdrawal transaction');
    }

    console.log('Wallet updated successfully:', transactionResult);

    // Update transaction record with Stripe transfer ID
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({ 
        stripe_payment_intent_id: transfer.id,
        status: 'completed'
      })
      .eq('id', transactionResult.transaction_id);

    if (updateError) {
      console.error('Failed to update transaction record:', updateError);
    }

    console.log('Real withdrawal completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transactionResult.transaction_id,
        transfer_id: transfer.id,
        amount: amount,
        new_balance: transactionResult.new_balance,
        message: 'Withdrawal processed successfully. Funds will arrive in your account within 2-7 business days.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing real withdrawal:', error.message);
    
    let userFriendlyMessage = error.message;
    
    // Provide user-friendly error messages
    if (error.message.includes('Insufficient balance')) {
      userFriendlyMessage = 'No tienes suficiente saldo para este retiro.';
    } else if (error.message.includes('No connected account')) {
      userFriendlyMessage = 'Debes configurar tu cuenta de pagos antes de poder retirar fondos.';
    } else if (error.message.includes('not active') || error.message.includes('restricted')) {
      userFriendlyMessage = 'Tu cuenta de pagos necesita verificación. Completa el proceso en tu dashboard.';
    } else if (error.message.includes('Invalid withdrawal amount')) {
      userFriendlyMessage = 'Cantidad de retiro inválida.';
    }
    
    return new Response(
      JSON.stringify({ error: userFriendlyMessage }),
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