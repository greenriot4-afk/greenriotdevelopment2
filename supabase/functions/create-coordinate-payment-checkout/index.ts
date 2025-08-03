import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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

    const { amount, description, objectType = 'coordinate', currency = 'USD', taxIncluded = false, objectId } = await req.json();
    
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!['USD', 'EUR'].includes(currency)) {
      throw new Error('Unsupported currency');
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId = null;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const currencySymbol = currency === 'EUR' ? '€' : '$';
    const isEuropeanUser = currency === 'EUR';

    // Create Stripe checkout session with automatic tax calculation
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${objectType.charAt(0).toUpperCase() + objectType.slice(1)} Purchase`,
              description: description || `Purchase of ${objectType} for ${currencySymbol}${amount}`,
              tax_code: 'txcd_10103001', // Digital services tax code
            },
            unit_amount: Math.round(amount * 100), // Convert to smallest currency unit
            // For EU, we typically use tax-inclusive pricing
            ...(isEuropeanUser && taxIncluded && {
              tax_behavior: 'inclusive'
            })
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get("origin")}/objects?purchase_success=true`,
      cancel_url: `${req.headers.get("origin")}/objects?purchase_canceled=true`,
      automatic_tax: { enabled: true },
      customer_update: {
        address: 'auto',
        name: 'auto'
      },
      billing_address_collection: 'required',
      // For coordinate purchases, we want to collect tax ID for businesses
      tax_id_collection: { enabled: true },
      metadata: {
        user_id: user.id,
        amount: amount.toString(),
        currency: currency,
        type: 'coordinate_purchase',
        object_type: objectType,
        object_id: objectId || ''
      }
    };

    // Add customer info - either existing customer ID or email for new customers
    if (customerId) {
      sessionConfig.customer = customerId;
    } else {
      sessionConfig.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Create service role client
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get or create user wallet for the specified currency
    const { data: walletId } = await serviceSupabase
      .rpc('get_or_create_wallet', {
        p_user_id: user.id,
        p_currency: currency
      });

    // Create pending transaction
    await serviceSupabase
      .from('transactions')
      .insert({
        user_id: user.id,
        wallet_id: walletId,
        type: 'debit',
        amount: -amount, // Negative for debit
        currency: currency,
        status: 'pending',
        stripe_session_id: session.id,
        description: description || `${objectType} purchase`,
        object_type: objectType
      });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      message: `Redirecting to secure checkout for ${currencySymbol}${amount} purchase`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-coordinate-payment-checkout:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create coordinate payment checkout' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});