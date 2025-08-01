-- Enable the pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cleanup function to run every 6 hours
-- This will automatically delete abandoned objects older than 48 hours
SELECT cron.schedule(
  'cleanup-old-abandons-every-6-hours',
  '0 */6 * * *', -- Every 6 hours at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://zrhjykyualhbwjlpjckh.supabase.co/functions/v1/cleanup-old-abandons',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyaGp5a3l1YWxoYndqbHBqY2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTExODcsImV4cCI6MjA2OTYyNzE4N30.tH4tRyN-86bvk9CQnp32GLq6OO9LS7HCB5X48FRSkK4"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Create a function to manually trigger cleanup (for testing)
CREATE OR REPLACE FUNCTION public.trigger_abandons_cleanup()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;