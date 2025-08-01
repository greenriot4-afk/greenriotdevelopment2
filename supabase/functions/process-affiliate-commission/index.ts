import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-AFFILIATE-COMMISSION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    logStep("Processing session", { sessionId });

    // Get session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    if (!session.customer || !session.subscription) {
      throw new Error("Invalid session - missing customer or subscription");
    }

    const userId = session.metadata?.user_id;
    if (!userId) {
      throw new Error("User ID not found in session metadata");
    }

    logStep("Session details retrieved", { 
      userId, 
      customerId: session.customer.id,
      subscriptionId: session.subscription.id 
    });

    // Check if this user was referred within the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: referral, error: referralError } = await supabaseService
      .from('referrals')
      .select('*')
      .eq('referred_user_id', userId)
      .eq('commission_paid', false)
      .gte('referred_at', thirtyDaysAgo.toISOString())
      .single();

    if (referralError && referralError.code !== 'PGRST116') {
      throw referralError;
    }

    if (!referral) {
      logStep("No eligible referral found for user", { userId });
      return new Response(JSON.stringify({ success: true, message: "No referral commission applicable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Eligible referral found", { 
      referralId: referral.id, 
      affiliateUserId: referral.affiliate_user_id 
    });

    // Get subscription amount
    const subscription = await stripe.subscriptions.retrieve(session.subscription.id);
    const amount = subscription.items.data[0].price.unit_amount || 0;
    const commissionAmount = amount / 100; // Convert from cents to euros

    logStep("Commission amount calculated", { amount, commissionAmount });

    // Update referral with subscription info
    const { error: updateReferralError } = await supabaseService
      .from('referrals')
      .update({
        commission_paid: true,
        commission_amount: commissionAmount,
        subscription_date: new Date().toISOString()
      })
      .eq('id', referral.id);

    if (updateReferralError) {
      throw updateReferralError;
    }

    // Create commission record
    const { data: commission, error: commissionError } = await supabaseService
      .from('affiliate_commissions')
      .insert({
        affiliate_user_id: referral.affiliate_user_id,
        referral_id: referral.id,
        amount: commissionAmount,
        status: 'pending',
        stripe_session_id: sessionId
      })
      .select()
      .single();

    if (commissionError) {
      throw commissionError;
    }

    logStep("Commission record created", { commissionId: commission.id });

    // Add commission to affiliate's wallet
    const { error: walletError } = await supabaseService
      .from('wallets')
      .update({
        balance: supabaseService.rpc('increment_balance', { 
          user_id: referral.affiliate_user_id, 
          amount: commissionAmount 
        })
      })
      .eq('user_id', referral.affiliate_user_id);

    if (walletError) {
      logStep("Error updating wallet, trying direct approach", { error: walletError });
      
      // Alternative approach: get current balance and update
      const { data: wallet } = await supabaseService
        .from('wallets')
        .select('balance')
        .eq('user_id', referral.affiliate_user_id)
        .single();

      if (wallet) {
        const newBalance = parseFloat(wallet.balance.toString()) + commissionAmount;
        await supabaseService
          .from('wallets')
          .update({ balance: newBalance })
          .eq('user_id', referral.affiliate_user_id);
      }
    }

    // Update commission status to paid
    await supabaseService
      .from('affiliate_commissions')
      .update({
        status: 'paid',
        processed_at: new Date().toISOString()
      })
      .eq('id', commission.id);

    logStep("Commission processed successfully", { 
      affiliateUserId: referral.affiliate_user_id,
      commissionAmount 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      commission: commissionAmount,
      affiliateUserId: referral.affiliate_user_id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});