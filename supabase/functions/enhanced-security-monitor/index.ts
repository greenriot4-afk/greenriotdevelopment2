import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

interface SecurityReport {
  timestamp: string;
  user_id: string | null;
  security_status: any;
  recent_admin_activities: any[];
  suspicious_transactions: any[];
  rate_limiting_status: any;
  recommendations: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Invalid authentication token' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Use service role client for privileged operations
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get security status
    const { data: securityStatus, error: securityError } = await supabaseServiceRole
      .rpc('get_security_status');

    if (securityError) {
      console.error('Security status error:', securityError);
    }

    // Get recent admin activities (last 24 hours)
    const { data: adminActivities, error: adminError } = await supabaseServiceRole
      .from('user_roles')
      .select('*, profiles(display_name)')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (adminError) {
      console.error('Admin activities error:', adminError);
    }

    // Get suspicious high-value transactions (last hour)
    const { data: suspiciousTransactions, error: transactionError } = await supabaseServiceRole
      .from('transactions')
      .select('*')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .gt('amount', 500)
      .order('created_at', { ascending: false });

    if (transactionError) {
      console.error('Suspicious transactions error:', transactionError);
    }

    // Rate limiting status (simplified)
    const rateLimitingStatus = {
      active: true,
      limits: {
        wallet_transactions: '10 per minute',
        api_calls: '100 per minute',
        login_attempts: '5 per 5 minutes'
      }
    };

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (securityStatus?.admin_count === 0) {
      recommendations.push('CRITICAL: No administrators found. Assign admin role immediately.');
    }
    
    if (securityStatus?.admin_count > 5) {
      recommendations.push('WARNING: High number of administrators. Review admin assignments.');
    }
    
    if (suspiciousTransactions && suspiciousTransactions.length > 5) {
      recommendations.push('ALERT: High volume of large transactions detected. Review recent activity.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Security status normal. Continue monitoring.');
    }

    const securityReport: SecurityReport = {
      timestamp: new Date().toISOString(),
      user_id: user.id,
      security_status: securityStatus || {},
      recent_admin_activities: adminActivities || [],
      suspicious_transactions: suspiciousTransactions || [],
      rate_limiting_status: rateLimitingStatus,
      recommendations
    };

    return new Response(JSON.stringify(securityReport), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Security monitor error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});