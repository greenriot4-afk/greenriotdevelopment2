import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANUAL-COMMISSION-PROCESSING] ${step}${detailsStr}`);
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

    const { referralId } = await req.json();
    
    if (!referralId) {
      throw new Error("Referral ID is required");
    }

    logStep("Processing referral", { referralId });

    // Get referral details
    const { data: referral, error: referralError } = await supabaseService
      .from('referrals')
      .select('*')
      .eq('id', referralId)
      .eq('commission_paid', false)
      .single();

    if (referralError) {
      throw referralError;
    }

    if (!referral) {
      throw new Error("No eligible referral found");
    }

    logStep("Eligible referral found", { 
      referralId: referral.id, 
      affiliateUserId: referral.affiliate_user_id,
      referredUserId: referral.referred_user_id
    });

    // Get affiliate code and level
    const { data: affiliateCode, error: affiliateError } = await supabaseService
      .from('affiliate_codes')
      .select('level')
      .eq('user_id', referral.affiliate_user_id)
      .eq('code', referral.affiliate_code)
      .single();

    if (affiliateError) {
      throw affiliateError;
    }

    const affiliateLevel = affiliateCode.level || 'level_3';
    logStep("Affiliate level retrieved", { affiliateLevel });

    // Check if the referred user has an active subscription
    const { data: subscriber, error: subscriberError } = await supabaseService
      .from('subscribers')
      .select('subscription_tier, subscribed')
      .eq('user_id', referral.referred_user_id)
      .eq('subscribed', true)
      .single();

    if (subscriberError) {
      throw new Error("Referenced user does not have an active subscription");
    }

    // Calculate commission based on Premium subscription (19 EUR)
    const baseAmount = 19.00; // Premium subscription price

    // Calculate commission based on affiliate level
    const { data: commissionPercentageResult, error: percentageError } = await supabaseService
      .rpc('get_affiliate_commission_percentage', { affiliate_level: affiliateLevel });

    if (percentageError) {
      throw percentageError;
    }

    const commissionPercentage = commissionPercentageResult || 0.25; // Default to 25%
    const commissionAmount = baseAmount * commissionPercentage;

    logStep("Commission amount calculated", { 
      baseAmount, 
      affiliateLevel,
      commissionPercentage, 
      commissionAmount 
    });

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
        status: 'paid',
        stripe_session_id: 'manual_processing',
        affiliate_level: affiliateLevel,
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (commissionError) {
      throw commissionError;
    }

    logStep("Commission record created", { commissionId: commission.id });

    // Get or create wallet for affiliate user
    logStep("Getting or creating wallet", { affiliateUserId: referral.affiliate_user_id });
    const { data: walletId, error: walletIdError } = await supabaseService
      .rpc('get_or_create_wallet', {
        p_user_id: referral.affiliate_user_id,
        p_currency: 'EUR'
      });

    if (walletIdError) {
      logStep("Wallet creation error", { error: walletIdError });
      throw walletIdError;
    }

    logStep("Wallet retrieved/created", { walletId });

    // Add commission to affiliate's wallet using the atomic function
    logStep("Starting wallet balance update", { 
      walletId, 
      amount: commissionAmount, 
      userId: referral.affiliate_user_id 
    });
    
    const { data: walletResult, error: walletError } = await supabaseService
      .rpc('update_wallet_balance_atomic', {
        p_wallet_id: walletId,
        p_amount: commissionAmount,
        p_transaction_type: 'credit',
        p_user_id: referral.affiliate_user_id,
        p_description: `Affiliate commission for referral ${referral.id}`,
        p_object_type: 'affiliate_commission',
        p_currency: 'EUR'
      });

    if (walletError) {
      logStep("Wallet update error", { error: walletError });
      throw walletError;
    }

    logStep("Wallet update completed", { walletResult });

    logStep("Commission processed successfully", { 
      affiliateUserId: referral.affiliate_user_id,
      affiliateLevel,
      commissionPercentage,
      commissionAmount,
      walletResult
    });

    return new Response(JSON.stringify({ 
      success: true, 
      commission: commissionAmount,
      affiliateUserId: referral.affiliate_user_id,
      affiliateLevel,
      commissionPercentage,
      walletResult
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    logStep("ERROR", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});