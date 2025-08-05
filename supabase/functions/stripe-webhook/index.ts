import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Security headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Input sanitization function
const sanitizeString = (input: string | undefined): string => {
  if (!input) return '';
  return input.replace(/[<>'"&]/g, '').slice(0, 500);
};

serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // CRITICAL SECURITY FIX: Verify webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      throw new Error('Webhook secret not configured');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw new Error('Invalid signature');
    }
    console.log('Received verified Stripe webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Processing completed checkout session:', sanitizeString(session.id));

      // Check if this is a coordinate purchase
      const isCoordinatePurchase = session.metadata?.type === 'coordinate_purchase';
      
      if (isCoordinatePurchase) {
        // Handle coordinate purchase - eliminate object after successful payment
        const userId = sanitizeString(session.metadata?.user_id || '');
        const objectId = sanitizeString(session.metadata?.object_id || '');
        const amount = parseFloat(session.metadata?.amount || '0');
        
        if (!userId || !objectId || amount <= 0) {
          console.error('Missing required metadata for coordinate purchase');
          throw new Error('Invalid coordinate purchase metadata');
        }

        console.log(`Processing coordinate purchase: objectId=${objectId}, userId=${userId}, amount=${amount}`);
        
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
        const currency = sanitizeString(session.metadata?.currency || 'USD');
        const sellerAmount = Math.round(amount * 0.8); // 80% to seller
        const platformFee = amount - sellerAmount; // 20% platform fee
        
        // Get or create buyer wallet
        const { data: walletId } = await supabaseClient
          .rpc('get_or_create_wallet', {
            p_user_id: userId,
            p_currency: currency
          });

        if (!walletId) {
          throw new Error('Failed to get user wallet');
        }

        // 1. Deduct from buyer's wallet
        const { data: walletResult, error: walletError } = await supabaseClient
          .rpc('update_wallet_balance_atomic', {
            p_wallet_id: walletId,
            p_amount: amount,
            p_transaction_type: 'debit',
            p_user_id: userId,
            p_description: `Coordinate purchase: ${object.title}`,
            p_object_type: 'coordinate',
            p_currency: currency
          });

        if (walletError) {
          console.error('Failed to deduct from wallet:', walletError);
          throw walletError;
        }

        console.log('Successfully deducted from wallet:', walletResult);

        // 2. Add to seller (only if not the same user)
        if (sellerId !== userId) {
          const { data: sellerWalletId } = await supabaseClient
            .rpc('get_or_create_wallet', {
              p_user_id: sellerId,
              p_currency: currency
            });

          const { data: sellerResult, error: sellerError } = await supabaseClient
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
            console.error('Failed to credit seller:', sellerError);
            // Don't throw error here as buyer payment was successful - log the issue
            console.log('Seller credit failed but buyer payment was processed successfully');
          } else {
            console.log('Successfully credited seller:', sellerResult);
          }
        }

        // 3. Add platform commission to company wallet (20%)
        const { data: companyResult, error: companyError } = await supabaseClient
          .rpc('update_company_wallet_balance_atomic', {
            p_amount: platformFee,
            p_description: `Comisión 20% - Venta coordenadas: ${object.title}`
          });

        if (companyError) {
          console.error('Failed to process platform commission:', companyError);
          // Don't throw error here as main transaction was successful - log the issue
          console.log('Platform commission failed but transaction was processed successfully');
        } else {
          console.log('Successfully processed platform commission:', companyResult);
        }

        // Delete the object after successful payment and transfers
        const { error: deleteError } = await supabaseClient
          .from('objects')
          .delete()
          .eq('id', objectId);

        if (deleteError) {
          console.error('Failed to delete object:', deleteError);
          // Don't throw error here as payment was successful - log the issue
          console.log('Object deletion failed but payment was processed successfully');
        } else {
          console.log(`Successfully deleted object: ${objectId}`);
        }

      } else {
        // Handle regular deposit
        // Validate required metadata
        if (!session.metadata?.transaction_id || !session.metadata?.user_id) {
          console.error('Missing required metadata in session');
          throw new Error('Invalid session metadata');
        }

        const transactionId = sanitizeString(session.metadata.transaction_id);
        const userId = sanitizeString(session.metadata.user_id);

        // Get the transaction with validation
        const { data: transaction, error: getTransactionError } = await supabaseClient
          .from('transactions')
          .select('amount, wallet_id, user_id, status')
          .eq('id', transactionId)
          .eq('user_id', userId) // Additional security check
          .single();

        if (getTransactionError || !transaction) {
          console.error('Failed to get transaction:', getTransactionError);
          throw new Error('Transaction not found or access denied');
        }

        // Prevent double processing
        if (transaction.status === 'completed') {
          console.log('Transaction already processed:', transactionId);
          return new Response(JSON.stringify({ received: true, already_processed: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Validate amount is positive
        const amount = parseFloat(transaction.amount.toString());
        if (amount <= 0) {
          throw new Error('Invalid transaction amount');
        }

        // Use atomic wallet update function to prevent race conditions
        const { data: result, error: updateError } = await supabaseClient
          .rpc('update_wallet_balance_atomic', {
            p_wallet_id: transaction.wallet_id,
            p_amount: amount,
            p_transaction_type: 'credit',
            p_user_id: userId,
            p_description: `Stripe deposit: ${sanitizeString(session.id)}`,
            p_object_type: 'deposit'
          });

        if (updateError) {
          console.error('Failed to update wallet atomically:', updateError);
          
          // Mark transaction as failed
          await supabaseClient
            .from('transactions')
            .update({ 
              status: 'failed',
              description: `Failed: ${updateError.message}`
            })
            .eq('id', transactionId);
            
          throw updateError;
        }

        // Update transaction with Stripe payment intent
        const { error: transactionUpdateError } = await supabaseClient
          .from('transactions')
          .update({ 
            status: 'completed',
            stripe_payment_intent_id: sanitizeString(session.payment_intent?.toString() || ''),
            stripe_session_id: sanitizeString(session.id)
          })
          .eq('id', transactionId);

        if (transactionUpdateError) {
          console.error('Failed to update transaction status:', transactionUpdateError);
        }

        console.log('Successfully processed deposit:', result);
      }
      
      // Process affiliate commission for subscriptions
      if (session.mode === 'subscription' && session.metadata?.user_id) {
        try {
          console.log('Processing affiliate commission for subscription session:', session.id);
          
          // Call process-affiliate-commission function
          const { data: commissionResult, error: commissionError } = await supabaseClient.functions.invoke(
            'process-affiliate-commission',
            {
              body: { sessionId: session.id }
            }
          );
          
          if (commissionError) {
            console.error('Failed to process affiliate commission:', commissionError);
          } else {
            console.log('Affiliate commission processed successfully:', commissionResult);
          }
        } catch (error) {
          console.error('Error calling process-affiliate-commission:', error);
          // Don't throw here as the main payment was successful
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});