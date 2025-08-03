import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

    // Create client for user authentication
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

    const { amount, description, objectType = 'coordinate', currency = 'USD' } = await req.json();
    
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
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

    // Use atomic wallet update function
    const { data: result, error: atomicError } = await serviceSupabase
      .rpc('update_wallet_balance_atomic', {
        p_wallet_id: walletId,
        p_amount: amount,
        p_transaction_type: 'debit',
        p_user_id: user.id,
        p_description: description || `${objectType} purchase`,
        p_object_type: objectType,
        p_currency: currency
      });

    if (atomicError) {
      console.error('Error in atomic wallet update:', atomicError);
      throw new Error(atomicError.message || 'Error processing payment');
    }

    // Type assertion for the RPC result
    const walletResult = result as {
      success: boolean;
      transaction_id: string;
      previous_balance: number;
      new_balance: number;
      currency: string;
    };

    return new Response(JSON.stringify({ 
      success: true,
      transaction_id: walletResult.transaction_id,
      new_balance: walletResult.new_balance,
      currency: currency,
      message: `Successfully purchased ${objectType} for ${currency === 'EUR' ? '€' : '$'}${amount}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-coordinate-payment:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process coordinate payment' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});