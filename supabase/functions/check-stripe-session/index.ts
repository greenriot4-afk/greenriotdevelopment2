import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

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

    const { session_id } = await req.json();
    if (!session_id) {
      throw new Error('Session ID required');
    }

    console.log('Checking Stripe session:', session_id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Get the session details
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    console.log('Session status:', session.status);
    console.log('Payment status:', session.payment_status);
    console.log('Amount total:', session.amount_total);
    console.log('Customer email:', session.customer_details?.email);

    return new Response(
      JSON.stringify({ 
        session_id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        customer_email: session.customer_details?.email,
        created: session.created,
        metadata: session.metadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking Stripe session:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
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