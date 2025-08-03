-- Phase 1: Fix Database Function Search Path Issues (Critical Security Fix)

-- Update refresh_objects_view function to include proper search path
CREATE OR REPLACE FUNCTION public.refresh_objects_view()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.objects_with_profiles;
END;
$function$;

-- Update trigger_abandons_cleanup function to include proper search path  
CREATE OR REPLACE FUNCTION public.trigger_abandons_cleanup()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
  -- This function can be called manually to trigger cleanup
  -- Useful for testing or manual maintenance
  
  SELECT net.http_post(
    url := 'https://zrhjykyualhbwjlpjckh.supabase.co/functions/v1/cleanup-old-abandons',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyaGp5a3l1YWxoYndqbHBqY2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTExODcsImV4cCI6MjA2OTYyNzE4N30.tH4tRyN-86bvk9CQnp32GLq6OO9LS7HCB5X48FRSkK4"}'::jsonb,
    body := '{"manual_trigger": true}'::jsonb
  ) INTO result;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Cleanup triggered manually',
    'timestamp', now()
  );
END;
$function$;