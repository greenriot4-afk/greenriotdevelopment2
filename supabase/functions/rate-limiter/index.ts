import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

interface RateLimitRequest {
  action: string;
  limit?: number;
  window?: number; // in seconds
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
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

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { action, limit = 10, window = 60 }: RateLimitRequest = await req.json();

    // Validate input
    if (!action || typeof action !== 'string') {
      throw new Error('Action is required');
    }

    if (limit < 1 || limit > 1000) {
      throw new Error('Limit must be between 1 and 1000');
    }

    if (window < 1 || window > 3600) {
      throw new Error('Window must be between 1 and 3600 seconds');
    }

    // Create service role client for rate limiting operations
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Check current rate limit (this would require a rate_limits table)
    const windowStart = new Date(Date.now() - window * 1000);
    const rateLimitKey = `${user.id}:${action}`;

    // For now, return a simple rate limit check
    // In a real implementation, you'd store this in a table or Redis
    const currentTime = new Date();
    const rateLimitInfo = {
      user_id: user.id,
      action: action,
      limit: limit,
      window: window,
      current_count: 0, // Would be calculated from actual tracking
      remaining: limit,
      reset_time: new Date(currentTime.getTime() + window * 1000),
      allowed: true
    };

    return new Response(JSON.stringify(rateLimitInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Rate limiter error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Rate limiting error',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});