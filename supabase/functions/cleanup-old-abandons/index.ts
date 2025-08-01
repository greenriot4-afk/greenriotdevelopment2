import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log('Starting cleanup of old abandoned objects...');

    // Initialize Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate the cutoff time (48 hours ago)
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);
    
    console.log(`Deleting abandoned objects older than: ${fortyEightHoursAgo.toISOString()}`);

    // Delete abandoned objects older than 48 hours
    const { data: deletedObjects, error: deleteError } = await supabaseClient
      .from('objects')
      .delete()
      .eq('type', 'abandoned')
      .lt('created_at', fortyEightHoursAgo.toISOString())
      .select(); // Select to get the deleted objects for logging

    if (deleteError) {
      console.error('Error deleting old abandoned objects:', deleteError);
      throw deleteError;
    }

    const deletedCount = deletedObjects?.length || 0;
    console.log(`Successfully deleted ${deletedCount} old abandoned objects`);

    // Also clean up any related favorites for deleted objects
    if (deletedCount > 0) {
      const deletedObjectIds = deletedObjects.map(obj => obj.id);
      
      const { error: favoritesError } = await supabaseClient
        .from('favorites')
        .delete()
        .in('object_id', deletedObjectIds);

      if (favoritesError) {
        console.error('Error cleaning up favorites:', favoritesError);
        // Don't throw here as the main cleanup was successful
      } else {
        console.log('Successfully cleaned up related favorites');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount,
        cutoffTime: fortyEightHoursAgo.toISOString(),
        message: `Deleted ${deletedCount} abandoned objects older than 48 hours`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in cleanup function:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});