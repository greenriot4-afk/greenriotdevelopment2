import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

interface WithdrawalRequest {
  amount: number;
  currency?: 'USD' | 'EUR';
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
    const { amount, currency = 'USD' }: WithdrawalRequest = body;

    // Comprehensive input validation
    if (!amount || typeof amount !== 'number' || !Number.isFinite(amount)) {
      throw new Error('Invalid amount format');
    }

    if (amount < 10) {
      const currencySymbol = currency === 'EUR' ? '€' : '$';
      throw new Error(`Minimum withdrawal amount is ${currencySymbol}10`);
    }

    if (amount > 100000) {
      throw new Error('Maximum withdrawal amount is 100,000');
    }

    if (!['USD', 'EUR'].includes(currency)) {
      throw new Error('Unsupported currency');
    }

    // Create service role client for database operations
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    // Use atomic wallet update function
    const { data: result, error: atomicError } = await serviceSupabase
      .rpc('update_wallet_balance_atomic', {
        p_wallet_id: wallet.id,
        p_amount: amount,
        p_transaction_type: 'withdrawal',
        p_user_id: user.id,
        p_description: `Withdrawal of ${currency === 'EUR' ? '€' : '$'}${amount}`,
        p_object_type: 'withdrawal',
        p_currency: currency
      });

    if (atomicError) {
      throw new Error(atomicError.message || 'Failed to process withdrawal');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully withdrew ${currency === 'EUR' ? '€' : '$'}${amount}`,
      currency: currency
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process withdrawal' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});