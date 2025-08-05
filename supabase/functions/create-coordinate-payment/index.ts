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

    const { amount, description, objectType = 'coordinate', currency = 'USD', objectId } = await req.json();
    
    console.log('Request payload:', { amount, objectType, currency, objectId });
    
    if (!amount || amount <= 0) {
      console.log('Invalid amount error:', amount);
      return new Response(JSON.stringify({ error: 'Cantidad inválida' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!['USD', 'EUR'].includes(currency)) {
      console.log('Unsupported currency error:', currency);
      return new Response(JSON.stringify({ error: 'Moneda no soportada' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!objectId) {
      console.log('Missing objectId error');
      return new Response(JSON.stringify({ error: 'ID del objeto es requerido' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create service role client
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get object details to find the seller
    const { data: object, error: objectError } = await serviceSupabase
      .from('objects')
      .select('user_id, title, price_credits')
      .eq('id', objectId)
      .single();

    if (objectError || !object) {
      console.log('Object not found error:', { objectError, objectId, object });
      return new Response(JSON.stringify({ error: 'Objeto no encontrado' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const sellerId = object.user_id;
    
    console.log('Checking ownership:', {
      buyerId: user.id,
      sellerId: sellerId,
      isSameUser: sellerId === user.id
    });
    
    // Check if user is trying to buy their own object
    if (sellerId === user.id) {
      console.log('User trying to buy own object - returning error');
      return new Response(JSON.stringify({ 
        error: 'No puedes comprar una coordenada publicada por ti mismo!' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log('Purchase validation passed, proceeding with payment');
    // Ensure platform fee is always at least 1 unit for company commission
    const platformFee = Math.max(1, Math.round(amount * 0.2)); // Minimum 1 unit commission
    const sellerAmount = amount - platformFee; // Rest goes to seller

    // Get or create buyer wallet for the specified currency
    const { data: walletId } = await serviceSupabase
      .rpc('get_or_create_wallet', {
        p_user_id: user.id,
        p_currency: currency
      });

    // 1. Deduct from buyer
    const { data: buyerResult, error: buyerError } = await serviceSupabase
      .rpc('update_wallet_balance_atomic', {
        p_wallet_id: walletId,
        p_amount: amount,
        p_transaction_type: 'debit',
        p_user_id: user.id,
        p_description: description || `${objectType} purchase`,
        p_object_type: objectType,
        p_currency: currency
      });

    if (buyerError) {
      throw new Error(`Failed to process buyer payment: ${buyerError.message}`);
    }

    // 2. Add to seller
    const { data: sellerWalletId } = await serviceSupabase
      .rpc('get_or_create_wallet', {
        p_user_id: sellerId,
        p_currency: currency
      });

    const { data: sellerResult, error: sellerError } = await serviceSupabase
      .rpc('update_wallet_balance_atomic', {
        p_wallet_id: sellerWalletId,
        p_amount: sellerAmount,
        p_transaction_type: 'credit',
        p_user_id: sellerId,
        p_description: `Venta de coordenadas: ${object.title} (80% after platform fee)`,
        p_object_type: 'coordinate_sale',
        p_currency: currency
      });

    if (sellerError) {
      throw new Error(`Failed to process seller payment: ${sellerError.message}`);
    }

    // 3. Add platform commission to company wallet (20%)
    const { data: companyResult, error: companyError } = await serviceSupabase
      .rpc('update_company_wallet_balance_atomic', {
        p_amount: platformFee,
        p_description: `Comisión 20% - Venta coordenadas: ${object.title}`
      });

    if (companyError) {
      throw new Error(`Failed to process platform commission: ${companyError.message}`);
    }

    // 4. Delete the abandoned object after successful purchase
    const { error: deleteError } = await serviceSupabase
      .from('objects')
      .delete()
      .eq('id', objectId);

    if (deleteError) {
      console.error('Warning: Failed to delete object after purchase:', deleteError.message);
      // Don't throw error here as payment was successful
    }

    // Type assertion for the RPC result
    const walletResult = buyerResult as {
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
      sellerAmount: sellerAmount,
      platformFee: platformFee,
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