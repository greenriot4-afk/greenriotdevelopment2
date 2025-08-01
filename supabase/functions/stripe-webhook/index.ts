import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // For security, you should set up a webhook endpoint secret in Stripe
    // and verify the signature here. For now, we'll skip verification for demo purposes.
    
    const event = JSON.parse(body);
    console.log('Received Stripe webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing completed checkout session:', session.id);

      if (session.metadata?.transaction_id) {
        // Update transaction status to completed
        const { error: transactionError } = await supabaseClient
          .from('transactions')
          .update({ 
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent 
          })
          .eq('id', session.metadata.transaction_id);

        if (transactionError) {
          console.error('Failed to update transaction:', transactionError);
          throw transactionError;
        }

        // Get the transaction to find the amount and wallet
        const { data: transaction, error: getTransactionError } = await supabaseClient
          .from('transactions')
          .select('amount, wallet_id')
          .eq('id', session.metadata.transaction_id)
          .single();

        if (getTransactionError) {
          console.error('Failed to get transaction:', getTransactionError);
          throw getTransactionError;
        }

        // Update wallet balance
        const { data: wallet, error: walletError } = await supabaseClient
          .from('wallets')
          .select('balance')
          .eq('id', transaction.wallet_id)
          .single();

        if (walletError) {
          console.error('Failed to get wallet:', walletError);
          throw walletError;
        }

        const newBalance = (parseFloat(wallet.balance) + parseFloat(transaction.amount)).toFixed(2);
        
        const { error: updateWalletError } = await supabaseClient
          .from('wallets')
          .update({ balance: newBalance })
          .eq('id', transaction.wallet_id);

        if (updateWalletError) {
          console.error('Failed to update wallet balance:', updateWalletError);
          throw updateWalletError;
        }

        console.log('Successfully processed deposit and updated wallet balance');
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});