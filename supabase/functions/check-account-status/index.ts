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
    console.log('=== Checking account status ===');
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User authentication failed');
    }

    console.log('Checking account status for user:', user.id);

    // Get connected account from database
    const { data: connectedAccount, error: accountError } = await supabaseClient
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (accountError) {
      console.error('Error fetching connected account:', accountError);
      throw new Error('Failed to check account status');
    }

    if (!connectedAccount) {
      console.log('No connected account found');
      return new Response(
        JSON.stringify({ 
          account_status: 'not_connected',
          needs_onboarding: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe and get latest account status
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    const account = await stripe.accounts.retrieve(connectedAccount.stripe_account_id);
    console.log('Retrieved Stripe account:', account.id);

    // Determine current status
    let accountStatus = 'pending';
    let canWithdraw = false;
    let statusMessage = '';

    if (account.details_submitted) {
      if (account.charges_enabled && account.payouts_enabled && 
          !account.requirements?.currently_due?.length) {
        accountStatus = 'active';
        canWithdraw = true;
        statusMessage = 'Tu cuenta está verificada y puedes retirar fondos.';
      } else if (account.requirements?.currently_due?.length > 0) {
        accountStatus = 'restricted';
        statusMessage = 'Tu cuenta necesita información adicional para activar retiros.';
      } else {
        accountStatus = 'under_review';
        statusMessage = 'Tu cuenta está siendo revisada por Stripe.';
      }
    } else {
      accountStatus = 'pending';
      statusMessage = 'Completa la configuración de tu cuenta para activar retiros.';
    }

    // Create new account link if needed
    let onboardingUrl = null;
    if (accountStatus !== 'active') {
      const origin = req.headers.get('origin') || 'http://localhost:3000';
      const accountLink = await stripe.accountLinks.create({
        account: connectedAccount.stripe_account_id,
        refresh_url: `${origin}/wallet?refresh=true`,
        return_url: `${origin}/wallet?success=true`,
        type: 'account_onboarding',
      });
      onboardingUrl = accountLink.url;
    }

    // Create dashboard link
    let dashboardUrl = null;
    try {
      const loginLink = await stripe.accounts.createLoginLink(connectedAccount.stripe_account_id);
      dashboardUrl = loginLink.url;
    } catch (error) {
      console.log('Dashboard not available:', error.message);
    }

    // Update database with latest status
    const { error: updateError } = await supabaseClient
      .from('connected_accounts')
      .update({
        account_status: accountStatus,
        onboarding_url: onboardingUrl,
        dashboard_url: dashboardUrl,
        capabilities: account.capabilities,
        requirements: account.requirements,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating account status:', updateError);
    }

    // Update profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ account_status: accountStatus })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    console.log('Account status check completed:', accountStatus);

    return new Response(
      JSON.stringify({
        account_status: accountStatus,
        can_withdraw: canWithdraw,
        status_message: statusMessage,
        onboarding_url: onboardingUrl,
        dashboard_url: dashboardUrl,
        needs_onboarding: !account.details_submitted,
        requirements: account.requirements?.currently_due || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking account status:', error.message);
    
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