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
    console.log('=== TEST COORDINATE PURCHASE START ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    const authHeader = req.headers.get("Authorization");
    console.log('Auth header exists:', !!authHeader);
    
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

    console.log('Getting user...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.error('User error:', userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    if (!user?.email) {
      console.error('No user or email found');
      throw new Error('User not found');
    }

    console.log('User found:', { id: user.id, email: user.email });

    // Parse body
    console.log('Parsing request body...');
    const text = await req.text();
    console.log('Raw body text:', text);
    
    let body;
    try {
      body = JSON.parse(text);
      console.log('Parsed body:', body);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error(`JSON parse error: ${parseError.message}`);
    }

    const { amount, objectId } = body;
    console.log('Extracted params:', { amount, objectId });

    if (!amount || amount <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    if (!objectId) {
      throw new Error('Object ID is required');
    }

    // Create service role client
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log('Fetching object...');
    const { data: object, error: objectError } = await serviceSupabase
      .from('objects')
      .select('user_id, title, price_credits')
      .eq('id', objectId)
      .maybeSingle();

    console.log('Object result:', { object, objectError });

    if (objectError) {
      throw new Error(`Object fetch error: ${objectError.message}`);
    }

    if (!object) {
      throw new Error('Object not found');
    }

    console.log('=== TEST SUCCESSFUL ===');
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Test function working correctly',
      user: { id: user.id, email: user.email },
      object: object,
      params: { amount, objectId }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('=== TEST ERROR ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});