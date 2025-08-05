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

    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('Service client initialized');

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

    // For now, just return success with debug info
    console.log('All validation passed, returning success');
    
    return new Response(JSON.stringify({ 
      success: true,
      debug: {
        userId: user.id,
        objectId,
        amount,
        objectType,
        step: 'debug_success'
      },
      platformFee: 0,
      sellerAmount: 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

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
      throw new Error('Buyer wallet not found');
    }

    // Check if buyer has enough balance
    console.log('Balance check:', { required: amount, available: buyerWallet.balance });
    if (buyerWallet.balance < amount) {
      console.error('Insufficient balance:', { required: amount, available: buyerWallet.balance });
      throw new Error(`No tienes suficiente saldo. Necesitas $${amount} pero solo tienes $${buyerWallet.balance}.`);
    }

    // Get or create seller's wallet
    let { data: sellerWallet, error: sellerWalletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', sellerId)
      .single();

    if (sellerWalletError || !sellerWallet) {
      // Create seller wallet if it doesn't exist
      const { data: newWallet, error: createError } = await supabaseClient
        .from('wallets')
        .insert({
          user_id: sellerId,
          balance: 0
        })
        .select()
        .single();

      if (createError) {
        throw new Error('Failed to create seller wallet');
      }
      sellerWallet = newWallet;
    }

    // Process the transaction atomically
    // 1. Deduct from buyer
    const { data: buyerResult, error: buyerError } = await supabaseClient
      .rpc('update_wallet_balance_atomic', {
        p_wallet_id: buyerWallet.id,
        p_amount: amount,
        p_transaction_type: 'debit',
        p_user_id: user.id,
        p_description: description || `Coordenadas para: ${object.title}`,
        p_object_type: objectType || 'coordinate'
      });

    console.log('Buyer debit result:', { buyerResult, buyerError });

    if (buyerError) {
      console.error('Failed to deduct from buyer:', buyerError);
      throw new Error(`Failed to process buyer payment: ${buyerError.message}`);
    }

    // 2. Add to seller (only if not the same user)
    let sellerResult = null;
    if (sellerId !== user.id) {
      const { data: result, error: sellerError } = await supabaseClient
        .rpc('update_wallet_balance_atomic', {
          p_wallet_id: sellerWallet.id,
          p_amount: sellerAmount,
          p_transaction_type: 'credit',
          p_user_id: sellerId,
          p_description: `Venta de coordenadas: ${object.title} (80% after platform fee)`,
          p_object_type: 'coordinate_sale'
        });

      console.log('Seller credit result:', { result, sellerError });

      if (sellerError) {
        console.error('Failed to credit seller:', sellerError);
        // Note: In a real system, we'd want to rollback the buyer transaction here
        throw new Error(`Failed to process seller payment: ${sellerError.message}`);
      }
      
      sellerResult = result;
    } else {
      console.log('Buyer and seller are the same user, no seller credit needed');
    }

    // 3. Add platform commission to company wallet (20%)
    const { data: companyResult, error: companyError } = await supabaseClient
      .rpc('update_company_wallet_balance_atomic', {
        p_amount: platformFee,
        p_description: `Comisión 20% - Venta coordenadas: ${object.title}`
      });

    console.log('Company wallet result:', { companyResult, companyError });

    if (companyError) {
      console.error('Failed to add commission to company wallet:', companyError);
      // Note: In a real system, we'd want to rollback the previous transactions here
      throw new Error(`Failed to process platform commission: ${companyError.message}`);
    }

    // 4. Delete the object immediately after successful payment (only for abandoned objects)
    if (objectType === 'abandoned') {
      const { error: deleteError } = await supabaseClient
        .from('objects')
        .delete()
        .eq('id', objectId);

      if (deleteError) {
        console.error('Failed to delete object after payment:', deleteError);
        // Don't throw error here as payment was successful - log the issue
        console.log('Object deletion failed but payment was processed successfully');
      } else {
        console.log(`Successfully deleted abandoned object: ${objectId}`);
      }
    }

    console.log('Payment processed successfully:', {
      buyerTransaction: buyerResult,
      sellerTransaction: sellerResult,
      companyCommission: companyResult,
      objectDeleted: objectType === 'abandoned'
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        buyerTransaction: buyerResult,
        sellerAmount: sellerId !== user.id ? sellerAmount : 0,
        platformFee
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing coordinate purchase:', error.message);
    console.error('Full error details:', error);
    
    let userFriendlyMessage = error.message;
    let statusCode = 400;
    
    // Provide more user-friendly error messages
    if (error.message.includes('Insufficient balance') || error.message.includes('No tienes suficiente saldo')) {
      userFriendlyMessage = 'No tienes suficiente saldo para esta compra. Recarga tu wallet.';
      statusCode = 400;
    } else if (error.message.includes('Object not found')) {
      userFriendlyMessage = 'El objeto ya no está disponible.';
      statusCode = 404;
    } else if (error.message.includes('Invalid user token') || error.message.includes('Authentication')) {
      userFriendlyMessage = 'Sesión expirada. Inicia sesión nuevamente.';
      statusCode = 401;
    } else if (error.message.includes('Missing objectId or amount')) {
      userFriendlyMessage = 'Error en los datos del pago.';
      statusCode = 400;
    } else if (error.message.includes('Company wallet') || error.message.includes('commission')) {
      userFriendlyMessage = 'Error interno del sistema. Intenta de nuevo.';
      statusCode = 500;
    } else {
      userFriendlyMessage = 'Error al procesar el pago. Intenta de nuevo.';
      statusCode = 500;
    }
    
    return new Response(
      JSON.stringify({ 
        error: userFriendlyMessage,
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});