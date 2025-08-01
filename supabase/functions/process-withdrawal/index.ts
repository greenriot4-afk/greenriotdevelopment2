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

    // Parse request body with input validation
    const body = await req.json();
    const { amount }: WithdrawalRequest = body;

    // Comprehensive input validation
    if (!amount || typeof amount !== 'number' || !Number.isFinite(amount)) {
      throw new Error('Invalid amount format');
    }

    if (amount < 10) {
      throw new Error('Minimum withdrawal amount is $10');
    }

    if (amount > 10000) {
      throw new Error('Maximum withdrawal amount is $10,000');
    }

    // Validate decimal places (max 2)
    if (Number((amount % 1).toFixed(2)) !== (amount % 1)) {
      throw new Error('Amount can have maximum 2 decimal places');
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

    // Use atomic wallet update function to prevent race conditions
    const { data: result, error: atomicError } = await supabaseClient
      .rpc('update_wallet_balance_atomic', {
        p_wallet_id: wallet.id,
        p_amount: amount,
        p_transaction_type: 'withdrawal',
        p_user_id: user.id,
        p_description: `Withdrawal of $${amount}`,
        p_object_type: 'withdrawal'
      });

    if (atomicError) {
      console.error('Atomic withdrawal failed:', atomicError);
      throw new Error('Failed to process withdrawal: ' + atomicError.message);
    }

    console.log('Withdrawal processed successfully:', result.transaction_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction_id: result.transaction_id,
        previous_balance: result.previous_balance,
        new_balance: result.new_balance
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