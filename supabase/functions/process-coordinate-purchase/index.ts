import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log('=== Starting coordinate purchase process ===');
    
    const authHeader = req.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(JSON.stringify({ 
        error: 'No authorization header provided',
        step: 'auth_check'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Get user from JWT using anon key
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    console.log('User client initialized');

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    console.log('User auth result:', { userId: user?.id, error: userError?.message });
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(JSON.stringify({ 
        error: 'Invalid user token',
        step: 'user_auth',
        details: userError?.message
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const requestBody = await req.json();
    console.log('Raw request body:', requestBody);
    
    const { objectId, amount, description, objectType } = requestBody;
    
    if (!objectId || !amount) {
      console.error('Missing required fields:', { objectId, amount });
      return new Response(JSON.stringify({ 
        error: 'Missing objectId or amount',
        step: 'validation',
        received: { objectId, amount, description, objectType }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('Service client initialized');

    // Get object details to find the seller
    const { data: object, error: objectError } = await supabaseClient
      .from('objects')
      .select('user_id, title, price_credits')
      .eq('id', objectId)
      .single();

    console.log('Object fetch result:', { object, error: objectError?.message });

    if (objectError || !object) {
      console.error('Failed to fetch object:', objectError);
      return new Response(JSON.stringify({ 
        error: 'Object not found',
        step: 'object_fetch',
        details: objectError?.message
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const sellerId = object.user_id;
    const sellerAmount = Math.round(amount * 0.8); // 80% to seller (20% commission)
    const platformFee = amount - sellerAmount; // 20% platform fee

    console.log('Payment breakdown:', { 
      totalAmount: amount, 
      sellerAmount, 
      platformFee, 
      sellerId 
    });

    // Get buyer's wallet
    console.log('Fetching buyer wallet for user:', user.id);
    const { data: buyerWallet, error: buyerWalletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('Buyer wallet result:', { wallet: buyerWallet, error: buyerWalletError?.message });

    if (buyerWalletError || !buyerWallet) {
      console.error('Buyer wallet error:', buyerWalletError);
      return new Response(JSON.stringify({ 
        error: 'Buyer wallet not found',
        step: 'buyer_wallet',
        details: buyerWalletError?.message
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check if buyer has enough balance
    console.log('Balance check:', { required: amount, available: buyerWallet.balance });
    if (buyerWallet.balance < amount) {
      console.error('Insufficient balance:', { required: amount, available: buyerWallet.balance });
      return new Response(JSON.stringify({ 
        error: `No tienes suficiente saldo. Necesitas $${amount} pero solo tienes $${buyerWallet.balance}.`,
        step: 'balance_check',
        required: amount,
        available: buyerWallet.balance
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // For debugging, let's just return success here first
    console.log('All checks passed, returning debug success');
    
    return new Response(JSON.stringify({ 
      success: true,
      debug: true,
      step: 'all_checks_passed',
      buyerTransaction: { test: true },
      sellerAmount,
      platformFee
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing coordinate purchase:', error.message);
    console.error('Full error details:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      step: 'catch_block',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});