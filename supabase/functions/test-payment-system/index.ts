import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-TESTING] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting payment system tests");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const testResults = {
      stripeConnection: false,
      supabaseConnection: false,
      testCustomerCreation: false,
      testSubscriptionCreation: false,
      testPaymentIntentCreation: false,
      walletFunctionality: false,
      affiliateSystem: false,
      errors: [] as string[]
    };

    // Test 1: Stripe Connection
    logStep("Testing Stripe connection");
    try {
      const balance = await stripe.balance.retrieve();
      testResults.stripeConnection = true;
      logStep("Stripe connection successful", { available: balance.available });
    } catch (error) {
      const errorMsg = `Stripe connection failed: ${error.message}`;
      testResults.errors.push(errorMsg);
      logStep("ERROR", errorMsg);
    }

    // Test 2: Supabase Connection
    logStep("Testing Supabase connection");
    try {
      const { data, error } = await supabaseService.from('profiles').select('id').limit(1);
      if (error) throw error;
      testResults.supabaseConnection = true;
      logStep("Supabase connection successful");
    } catch (error) {
      const errorMsg = `Supabase connection failed: ${error.message}`;
      testResults.errors.push(errorMsg);
      logStep("ERROR", errorMsg);
    }

    // Test 3: Test Customer Creation
    logStep("Testing customer creation");
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const customer = await stripe.customers.create({
        email: testEmail,
        metadata: { test: 'true' }
      });
      
      // Clean up test customer
      await stripe.customers.del(customer.id);
      testResults.testCustomerCreation = true;
      logStep("Customer creation test successful", { customerId: customer.id });
    } catch (error) {
      const errorMsg = `Customer creation test failed: ${error.message}`;
      testResults.errors.push(errorMsg);
      logStep("ERROR", errorMsg);
    }

    // Test 4: Test Subscription Creation (without payment)
    logStep("Testing subscription creation");
    try {
      const testEmail = `test-sub-${Date.now()}@example.com`;
      const customer = await stripe.customers.create({
        email: testEmail,
        metadata: { test: 'true' }
      });

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: "Test Premium Subscription",
                description: "Test subscription for payment system testing"
              },
              unit_amount: 999, // $9.99
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
        metadata: {
          test: "true",
          subscription_type: "premium_test"
        }
      });

      // Clean up
      await stripe.customers.del(customer.id);
      testResults.testSubscriptionCreation = true;
      logStep("Subscription creation test successful", { sessionId: session.id });
    } catch (error) {
      const errorMsg = `Subscription creation test failed: ${error.message}`;
      testResults.errors.push(errorMsg);
      logStep("ERROR", errorMsg);
    }

    // Test 5: Test Payment Intent Creation
    logStep("Testing payment intent creation");
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000, // $10.00
        currency: 'usd',
        metadata: { test: 'true' }
      });

      testResults.testPaymentIntentCreation = true;
      logStep("Payment intent creation test successful", { paymentIntentId: paymentIntent.id });
    } catch (error) {
      const errorMsg = `Payment intent creation test failed: ${error.message}`;
      testResults.errors.push(errorMsg);
      logStep("ERROR", errorMsg);
    }

    // Test 6: Wallet Functionality
    logStep("Testing wallet functionality");
    try {
      const { data: wallets, error } = await supabaseService
        .from('wallets')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      testResults.walletFunctionality = true;
      logStep("Wallet functionality test successful", { walletsCount: wallets?.length || 0 });
    } catch (error) {
      const errorMsg = `Wallet functionality test failed: ${error.message}`;
      testResults.errors.push(errorMsg);
      logStep("ERROR", errorMsg);
    }

    // Test 7: Affiliate System
    logStep("Testing affiliate system");
    try {
      const { data: affiliates, error } = await supabaseService
        .from('affiliate_codes')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      testResults.affiliateSystem = true;
      logStep("Affiliate system test successful", { affiliatesCount: affiliates?.length || 0 });
    } catch (error) {
      const errorMsg = `Affiliate system test failed: ${error.message}`;
      testResults.errors.push(errorMsg);
      logStep("ERROR", errorMsg);
    }

    // Calculate overall success
    const totalTests = 7;
    const passedTests = Object.values(testResults).filter(result => result === true).length;
    const successRate = (passedTests / totalTests) * 100;

    logStep("Testing completed", { 
      passedTests, 
      totalTests, 
      successRate: `${successRate.toFixed(1)}%`,
      errors: testResults.errors 
    });

    return new Response(JSON.stringify({
      success: true,
      testResults,
      summary: {
        passedTests,
        totalTests,
        successRate: `${successRate.toFixed(1)}%`
      },
      message: testResults.errors.length === 0 
        ? "All payment system tests passed successfully! 🎉" 
        : `${passedTests}/${totalTests} tests passed. Check errors for details.`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("CRITICAL ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      message: "Payment system testing failed"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});