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
    console.log('Starting create-coordinate-payment with headers:', {
      authorization: !!req.headers.get("Authorization"),
      contentType: req.headers.get("Content-Type")
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('No authorization header provided');
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

    console.log('Getting user from auth token...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user?.email) {
      console.error('Authentication failed:', { userError, hasUser: !!user, hasEmail: !!user?.email });
      throw new Error(`Authentication failed: ${userError?.message || 'User not found'}`);
    }

    console.log('User authenticated successfully:', { userId: user.id, email: user.email });

    console.log('Parsing request body...');
    let body;
    try {
      const text = await req.text();
      console.log('Raw request text:', text);
      body = JSON.parse(text);
      console.log('Parsed body:', body);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }
    
    const { amount, description, objectType = 'coordinate', currency = 'USD', objectId } = body;
    
    console.log('Validating parameters:', { amount, objectType, currency, objectId });
    
    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      throw new Error('Invalid amount');
    }

    if (!['USD', 'EUR'].includes(currency)) {
      console.error('Unsupported currency:', currency);
      throw new Error('Unsupported currency');
    }

    if (!objectId) {
      console.error('Object ID is required');
      throw new Error('Object ID is required');
    }

    // Create service role client
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get object details to find the seller
    console.log('Fetching object details for ID:', objectId);
    const { data: object, error: objectError } = await serviceSupabase
      .from('objects')
      .select('user_id, title, price_credits')
      .eq('id', objectId)
      .maybeSingle();

    console.log('Object query result:', { object, objectError });

    if (objectError) {
      console.error('Database error fetching object:', objectError);
      throw new Error(`Database error: ${objectError.message}`);
    }
    
    if (!object) {
      console.error('Object not found with ID:', objectId);
      throw new Error('Object not found');
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
    
    // Calculate platform fee (exactly 20%)
    const platformFee = Math.round(amount * 0.2); // Exactly 20% platform fee
    const sellerAmount = amount - platformFee; // Seller gets the remainder

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
    console.error('Error in create-coordinate-payment:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return specific error details for debugging
    const errorResponse = {
      error: error.message || 'Failed to process coordinate payment',
      errorType: error.name || 'UnknownError',
      timestamp: new Date().toISOString()
    };
    
    console.error('Returning error response:', errorResponse);
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});