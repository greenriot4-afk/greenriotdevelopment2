import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    console.log('Syncing Stripe status for user:', user.id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Get all pending transactions for the user
    const { data: pendingTransactions, error: transactionsError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .eq('type', 'deposit')
      .order('created_at', { ascending: false });

    if (transactionsError) {
      throw new Error('Failed to fetch transactions: ' + transactionsError.message);
    }

    console.log(`Found ${pendingTransactions?.length || 0} pending transactions`);

    if (!pendingTransactions || pendingTransactions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending transactions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get customer email from user
    const customerEmail = user.email;
    if (!customerEmail) {
      throw new Error('User email not found');
    }

    // Get recent Stripe sessions for this customer
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: {
        gte: Math.floor(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime() / 1000), // Last 7 days
      },
    });

    console.log(`Found ${sessions.data.length} recent Stripe sessions`);

    let updatedCount = 0;

    // Try to match pending transactions with completed Stripe sessions
    for (const transaction of pendingTransactions) {
      const matchingSession = sessions.data.find(session => 
        session.status === 'complete' &&
        session.payment_status === 'paid' &&
        session.amount_total === transaction.amount * 100 && // Convert to cents
        session.customer_details?.email === customerEmail
      );

      if (matchingSession) {
        console.log(`Matching session found for transaction ${transaction.id}: ${matchingSession.id}`);

        // Update wallet balance atomically
        const { data: result, error: updateError } = await supabaseClient
          .rpc('update_wallet_balance_atomic', {
            p_wallet_id: transaction.wallet_id,
            p_amount: parseFloat(transaction.amount.toString()),
            p_transaction_type: 'deposit',
            p_user_id: user.id,
            p_description: `Stripe deposit: ${matchingSession.id} (synced)`,
            p_object_type: 'deposit'
          });

        if (updateError) {
          console.error('Failed to update wallet:', updateError);
          continue;
        }

        // Update transaction status
        const { error: transactionUpdateError } = await supabaseClient
          .from('transactions')
          .update({ 
            status: 'completed',
            stripe_session_id: matchingSession.id,
            stripe_payment_intent_id: matchingSession.payment_intent?.toString(),
            description: `Deposit of $${transaction.amount} (synced from Stripe)`
          })
          .eq('id', transaction.id);

        if (transactionUpdateError) {
          console.error('Failed to update transaction:', transactionUpdateError);
        } else {
          updatedCount++;
          console.log(`Successfully synced transaction ${transaction.id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Synced ${updatedCount} out of ${pendingTransactions.length} pending transactions`,
        updated: updatedCount,
        total: pendingTransactions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing Stripe status:', error.message);
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