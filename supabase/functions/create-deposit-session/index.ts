import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DepositRequest {
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

    console.log('Processing deposit request for user:', user.id);

    // Parse request body with input validation
    const body = await req.json();
    const { amount }: DepositRequest = body;

    // Comprehensive input validation
    if (!amount || typeof amount !== 'number' || !Number.isFinite(amount)) {
      throw new Error('Invalid amount format');
    }

    if (amount < 10) {
      throw new Error('Minimum deposit amount is $10');
    }

    if (amount > 10000) {
      throw new Error('Maximum deposit amount is $10,000');
    }

    // Validate decimal places (max 2)
    if (Number((amount % 1).toFixed(2)) !== (amount % 1)) {
      throw new Error('Amount can have maximum 2 decimal places');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Get or create wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError && walletError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error('Failed to fetch wallet: ' + walletError.message);
    }

    let walletId = wallet?.id;

    // If wallet doesn't exist, create it
    if (!wallet) {
      const { data: newWallet, error: createWalletError } = await supabaseClient
        .from('wallets')
        .insert({ user_id: user.id, balance: 0.00 })
        .select()
        .single();

      if (createWalletError) {
        throw new Error('Failed to create wallet: ' + createWalletError.message);
      }
      walletId = newWallet.id;
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        wallet_id: walletId,
        type: 'deposit',
        amount: amount,
        status: 'pending',
        description: `Deposit of $${amount}`
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error('Failed to create transaction: ' + transactionError.message);
    }

    console.log('Created transaction:', transaction.id);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Wallet Deposit',
              description: `Add $${amount} to your wallet`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/?deposit_success=true`,
      cancel_url: `${req.headers.get('origin')}/?deposit_cancelled=true`,
      metadata: {
        transaction_id: transaction.id,
        user_id: user.id,
      },
    });

    // Update transaction with Stripe session ID
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({ stripe_session_id: session.id })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Failed to update transaction with session ID:', updateError);
    }

    console.log('Created Stripe session:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error creating deposit session:', error.message);
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