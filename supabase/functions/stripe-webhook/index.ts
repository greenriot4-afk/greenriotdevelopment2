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

// Input sanitization function
const sanitizeString = (input: string | undefined): string => {
  if (!input) return '';
  return input.replace(/[<>'"&]/g, '').slice(0, 500);
};

serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // CRITICAL SECURITY FIX: Verify webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      throw new Error('Webhook secret not configured');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw new Error('Invalid signature');
    }
    console.log('Received verified Stripe webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Processing completed checkout session:', sanitizeString(session.id));

      // Validate required metadata
      if (!session.metadata?.transaction_id || !session.metadata?.user_id) {
        console.error('Missing required metadata in session');
        throw new Error('Invalid session metadata');
      }

      const transactionId = sanitizeString(session.metadata.transaction_id);
      const userId = sanitizeString(session.metadata.user_id);

      // Get the transaction with validation
      const { data: transaction, error: getTransactionError } = await supabaseClient
        .from('transactions')
        .select('amount, wallet_id, user_id, status')
        .eq('id', transactionId)
        .eq('user_id', userId) // Additional security check
        .single();

      if (getTransactionError || !transaction) {
        console.error('Failed to get transaction:', getTransactionError);
        throw new Error('Transaction not found or access denied');
      }

      // Prevent double processing
      if (transaction.status === 'completed') {
        console.log('Transaction already processed:', transactionId);
        return new Response(JSON.stringify({ received: true, already_processed: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Validate amount is positive
      const amount = parseFloat(transaction.amount.toString());
      if (amount <= 0) {
        throw new Error('Invalid transaction amount');
      }

      // Use atomic wallet update function to prevent race conditions
      const { data: result, error: updateError } = await supabaseClient
        .rpc('update_wallet_balance_atomic', {
          p_wallet_id: transaction.wallet_id,
          p_amount: amount,
          p_transaction_type: 'credit',
          p_user_id: userId,
          p_description: `Stripe deposit: ${sanitizeString(session.id)}`,
          p_object_type: 'deposit'
        });

      if (updateError) {
        console.error('Failed to update wallet atomically:', updateError);
        
        // Mark transaction as failed
        await supabaseClient
          .from('transactions')
          .update({ 
            status: 'failed',
            description: `Failed: ${updateError.message}`
          })
          .eq('id', transactionId);
          
        throw updateError;
      }

      // Update transaction with Stripe payment intent
      const { error: transactionUpdateError } = await supabaseClient
        .from('transactions')
        .update({ 
          status: 'completed',
          stripe_payment_intent_id: sanitizeString(session.payment_intent?.toString() || ''),
          stripe_session_id: sanitizeString(session.id)
        })
        .eq('id', transactionId);

      if (transactionUpdateError) {
        console.error('Failed to update transaction status:', transactionUpdateError);
      }

      console.log('Successfully processed deposit:', result);
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