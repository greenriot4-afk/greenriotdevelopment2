import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user?.email) {
      throw new Error(`Authentication failed: ${userError?.message || 'User not found'}`);
    }

    const { amount, currency = 'USD' } = await req.json();
    
    if (!amount || amount < 10) {
      const currencySymbol = currency === 'EUR' ? '€' : '$';
      throw new Error(`Minimum withdrawal amount is ${currencySymbol}10`);
    }

    if (!['USD', 'EUR'].includes(currency)) {
      throw new Error('Unsupported currency');
    }

    // Create service role client
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get or create user wallet for the specified currency
    const { data: walletId } = await serviceSupabase
      .rpc('get_or_create_wallet', {
        p_user_id: user.id,
        p_currency: currency
      });

    const { data: wallet, error: walletError } = await serviceSupabase
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (walletError || !wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Get connected account
    const { data: connectedAccount, error: accountError } = await serviceSupabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (accountError || !connectedAccount?.stripe_account_id) {
      throw new Error('No connected account found. Please set up your payout account first.');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Stripe transfer in the correct currency
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency: currency.toLowerCase(),
      destination: connectedAccount.stripe_account_id,
      description: `Withdrawal of ${currency === 'EUR' ? '€' : '$'}${amount}`,
    });

    // Use atomic wallet update function
    const { data: result, error: atomicError } = await serviceSupabase
      .rpc('update_wallet_balance_atomic', {
        p_wallet_id: wallet.id,
        p_amount: amount,
        p_transaction_type: 'withdrawal',
        p_user_id: user.id,
        p_description: `Real withdrawal of ${currency === 'EUR' ? '€' : '$'}${amount}`,
        p_object_type: 'real_withdrawal',
        p_currency: currency
      });

    if (atomicError) {
      throw new Error(atomicError.message || 'Failed to process withdrawal');
    }

    // Type assertion for the RPC result
    const walletResult = result as {
      success: boolean;
      transaction_id: string;
      previous_balance: number;
      new_balance: number;
    };

    // Update transaction with Stripe transfer ID
    await serviceSupabase
      .from('transactions')
      .update({ 
        stripe_payment_intent_id: transfer.id,
        status: 'completed'
      })
      .eq('id', walletResult.transaction_id);

    return new Response(JSON.stringify({ 
      success: true,
      transfer_id: transfer.id,
      new_balance: walletResult.new_balance,
      currency: currency,
      message: `Successfully withdrew ${currency === 'EUR' ? '€' : '$'}${amount} to your connected account`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in process-real-withdrawal:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process real withdrawal' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});