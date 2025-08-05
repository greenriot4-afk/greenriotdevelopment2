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
    console.log("Function started");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { referralId } = await req.json();
    console.log("Processing referral:", referralId);
    
    if (!referralId) {
      throw new Error("Referral ID is required");
    }

    // Step 1: Get referral
    const { data: referral, error: referralError } = await supabaseService
      .from('referrals')
      .select('*')
      .eq('id', referralId)
      .maybeSingle();

    if (referralError) {
      console.error("Referral error:", referralError);
      throw new Error(`Referral error: ${referralError.message}`);
    }

    if (!referral) {
      throw new Error("Referral not found with the provided ID");
    }

    if (referral.commission_paid) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Commission already paid for this referral",
        commission: referral.commission_amount,
        paidAt: referral.subscription_date
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("Referral found:", referral.id);

    // Step 2: Calculate commission (fixed 4.75 EUR for Premium)
    const commissionAmount = 4.75;
    
    console.log("Commission amount:", commissionAmount);

    // Step 3: Update referral
    const { error: updateReferralError } = await supabaseService
      .from('referrals')
      .update({
        commission_paid: true,
        commission_amount: commissionAmount,
        subscription_date: new Date().toISOString()
      })
      .eq('id', referral.id);

    if (updateReferralError) {
      console.error("Update referral error:", updateReferralError);
      throw new Error(`Update referral error: ${updateReferralError.message}`);
    }

    console.log("Referral updated");

    // Step 4: Create commission record
    const { data: commission, error: commissionError } = await supabaseService
      .from('affiliate_commissions')
      .insert({
        affiliate_user_id: referral.affiliate_user_id,
        referral_id: referral.id,
        amount: commissionAmount,
        status: 'paid',
        stripe_session_id: 'manual_processing',
        affiliate_level: 'level_3',
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (commissionError) {
      console.error("Commission error:", commissionError);
      throw new Error(`Commission error: ${commissionError.message}`);
    }

    console.log("Commission record created:", commission.id);

    // Step 5: Handle wallet
    // Check if EUR wallet exists
    const { data: existingWallet } = await supabaseService
      .from('wallets')
      .select('id, balance')
      .eq('user_id', referral.affiliate_user_id)
      .eq('currency', 'EUR')
      .maybeSingle();

    let walletId;
    let currentBalance = 0;

    if (existingWallet) {
      walletId = existingWallet.id;
      currentBalance = parseFloat(existingWallet.balance.toString());
      console.log("Existing EUR wallet found:", walletId, "balance:", currentBalance);
    } else {
      // Create new EUR wallet
      const { data: newWallet, error: createError } = await supabaseService
        .from('wallets')
        .insert({
          user_id: referral.affiliate_user_id,
          currency: 'EUR',
          balance: 0
        })
        .select()
        .single();

      if (createError) {
        console.error("Create wallet error:", createError);
        throw new Error(`Create wallet error: ${createError.message}`);
      }

      walletId = newWallet.id;
      console.log("New EUR wallet created:", walletId);
    }

    // Step 6: Update wallet balance
    const newBalance = currentBalance + commissionAmount;
    
    const { error: updateWalletError } = await supabaseService
      .from('wallets')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', walletId);

    if (updateWalletError) {
      console.error("Update wallet error:", updateWalletError);
      throw new Error(`Update wallet error: ${updateWalletError.message}`);
    }

    console.log("Wallet updated. New balance:", newBalance);

    // Step 7: Create transaction
    const { error: transactionError } = await supabaseService
      .from('transactions')
      .insert({
        user_id: referral.affiliate_user_id,
        wallet_id: walletId,
        type: 'credit',
        amount: commissionAmount,
        status: 'completed',
        description: `Affiliate commission for referral ${referral.id}`,
        object_type: 'affiliate_commission',
        currency: 'EUR'
      });

    if (transactionError) {
      console.error("Transaction error:", transactionError);
      throw new Error(`Transaction error: ${transactionError.message}`);
    }

    console.log("Transaction created successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      commission: commissionAmount,
      affiliateUserId: referral.affiliate_user_id,
      newBalance: newBalance,
      message: "Commission processed successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return new Response(JSON.stringify({ 
      error: error.message || String(error) 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});