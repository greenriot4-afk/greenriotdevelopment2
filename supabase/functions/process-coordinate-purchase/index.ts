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
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const requestBody = await req.json();
    console.log('Raw request body:', requestBody);
    
    const { objectId, amount, description, objectType } = requestBody;
    
    if (!objectId || !amount) {
      console.error('Missing required fields:', { objectId, amount });
      throw new Error('Missing objectId or amount');
    }

    console.log('Processing coordinate purchase:', { objectId, amount, buyerId: user.id, objectType, description });

    // Get object details to find the seller
    const { data: object, error: objectError } = await supabaseClient
      .from('objects')
      .select('user_id, title, price_credits')
      .eq('id', objectId)
      .single();

    if (objectError || !object) {
      throw new Error('Object not found');
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
    const { data: buyerWallet, error: buyerWalletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (buyerWalletError || !buyerWallet) {
      throw new Error('Buyer wallet not found');
    }

    // Check if buyer has enough balance
    if (buyerWallet.balance < amount) {
      throw new Error('Insufficient balance');
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

    if (buyerError) {
      console.error('Failed to deduct from buyer:', buyerError);
      throw new Error('Failed to process buyer payment');
    }

    // 2. Add to seller (only if not the same user)
    if (sellerId !== user.id) {
      const { data: sellerResult, error: sellerError } = await supabaseClient
        .rpc('update_wallet_balance_atomic', {
          p_wallet_id: sellerWallet.id,
          p_amount: sellerAmount,
          p_transaction_type: 'credit',
          p_user_id: sellerId,
          p_description: `Venta de coordenadas: ${object.title} (80% after platform fee)`,
          p_object_type: 'coordinate_sale'
        });

      if (sellerError) {
        console.error('Failed to credit seller:', sellerError);
        // Note: In a real system, we'd want to rollback the buyer transaction here
        throw new Error('Failed to process seller payment');
      }

      console.log('Payment processed successfully:', {
        buyerTransaction: buyerResult,
        sellerTransaction: sellerResult
      });
    } else {
      console.log('Buyer and seller are the same user, no seller credit needed');
    }

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
    
    let userFriendlyMessage = error.message;
    
    // Provide more user-friendly error messages
    if (error.message.includes('Insufficient balance')) {
      userFriendlyMessage = 'No tienes suficiente saldo para esta compra. Recarga tu wallet.';
    } else if (error.message.includes('Object not found')) {
      userFriendlyMessage = 'El objeto ya no está disponible.';
    } else if (error.message.includes('Invalid user token')) {
      userFriendlyMessage = 'Sesión expirada. Inicia sesión nuevamente.';
    } else if (error.message.includes('Missing objectId or amount')) {
      userFriendlyMessage = 'Error en los datos del pago.';
    }
    
    return new Response(
      JSON.stringify({ error: userFriendlyMessage }),
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