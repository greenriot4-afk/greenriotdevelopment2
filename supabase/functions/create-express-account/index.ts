import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Starting Express account creation ===');
    
    const authHeader = req.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    console.log('Auth header value (first 20 chars):', authHeader?.substring(0, 20));
    
    if (!authHeader) {
      console.error('CRITICAL: No authorization header found');
      throw new Error('No authorization header');
    }

    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create user client with the auth token for user verification
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    console.log('Supabase clients initialized');

    // Get authenticated user using the user client
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    console.log('User authentication result:', { user: !!user, error: !!userError });
    
    if (userError) {
      console.error('User authentication error:', userError);
      throw new Error(`User authentication failed: ${userError.message}`);
    }
    
    if (!user) {
      console.error('No user found after authentication');
      throw new Error('User authentication failed - no user found');
    }

    console.log('User authenticated:', user.id);

    // Check if user already has a connected account
    const { data: existingAccount, error: checkError } = await supabaseClient
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing account:', checkError);
      throw new Error('Failed to check existing account');
    }

    if (existingAccount && existingAccount.account_status === 'active') {
      console.log('User already has active account');
      return new Response(
        JSON.stringify({ 
          success: true, 
          account_status: 'active',
          dashboard_url: existingAccount.dashboard_url 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    let accountId = existingAccount?.stripe_account_id;
    let account;

    if (!accountId) {
      // Create new Stripe Express account
      console.log('Creating new Stripe Express account');
      console.log('User email:', user.email);
      console.log('Stripe key exists:', !!Deno.env.get('STRIPE_SECRET_KEY'));
      
      try {
        console.log('About to call stripe.accounts.create...');
        account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });
        accountId = account.id;
        console.log('Created account successfully:', accountId);
      } catch (stripeError) {
        console.error('=== STRIPE ERROR DETAILS ===');
        console.error('Error type:', stripeError.type);
        console.error('Error code:', stripeError.code);
        console.error('Error message:', stripeError.message);
        console.error('Error param:', stripeError.param);
        console.error('Full error:', JSON.stringify(stripeError, null, 2));
        
        // Return specific Stripe error for debugging
        throw new Error(`Stripe Connect Error: ${stripeError.code} - ${stripeError.message}`);
      }
    } else {
      // Retrieve existing account
      account = await stripe.accounts.retrieve(accountId);
      console.log('Retrieved existing account:', accountId);
    }

    // Create account link for onboarding
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/wallet?refresh=true`,
      return_url: `${origin}/wallet?success=true`,
      type: 'account_onboarding',
    });

    console.log('Created account link:', accountLink.url);

    // Create login link for dashboard access
    let dashboardUrl = null;
    try {
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      dashboardUrl = loginLink.url;
      console.log('Created dashboard link');
    } catch (error) {
      console.log('Dashboard not available yet (account not fully set up)');
    }

    // Determine account status
    let accountStatus = 'pending';
    if (account.details_submitted && !account.requirements?.currently_due?.length) {
      accountStatus = 'active';
    } else if (account.details_submitted) {
      accountStatus = 'restricted';
    }

    // Upsert connected account record
    const { error: upsertError } = await supabaseClient
      .from('connected_accounts')
      .upsert({
        user_id: user.id,
        stripe_account_id: accountId,
        account_status: accountStatus,
        onboarding_url: accountLink.url,
        dashboard_url: dashboardUrl,
        capabilities: account.capabilities,
        requirements: account.requirements,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('Error upserting connected account:', upsertError);
      throw new Error('Failed to save account data');
    }

    // Update profile with account status
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ account_status: accountStatus })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    console.log('Express account creation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        account_id: accountId,
        account_status: accountStatus,
        onboarding_url: accountLink.url,
        dashboard_url: dashboardUrl,
        needs_onboarding: !account.details_submitted
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== ERROR in create-express-account ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    // Return more detailed error information
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack?.split('\n').slice(0, 3).join('\n')
      }),
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