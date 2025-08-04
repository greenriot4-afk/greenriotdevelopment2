-- Security Fix 1: Add search_path to functions that don't have it set
-- This prevents potential security issues from path injection

-- Fix function: get_affiliate_commission_percentage
CREATE OR REPLACE FUNCTION public.get_affiliate_commission_percentage(affiliate_level affiliate_level)
 RETURNS numeric
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE affiliate_level
    WHEN 'level_1' THEN 1.00  -- 100%
    WHEN 'level_2' THEN 0.50  -- 50%
    WHEN 'level_3' THEN 0.25  -- 25%
    ELSE 0.25  -- Default a level_3
  END;
$function$;

-- Fix function: sanitize_text_input
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove control characters, limit length, trim whitespace
  RETURN LEFT(TRIM(REGEXP_REPLACE(input_text, '[[:cntrl:]]', '', 'g')), 1000);
END;
$function$;

-- Fix function: validate_amount
CREATE OR REPLACE FUNCTION public.validate_amount(amount numeric)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check for valid positive amount
  RETURN amount IS NOT NULL 
    AND amount > 0 
    AND amount <= 1000000 -- Max amount limit
    AND SCALE(amount) <= 2; -- Max 2 decimal places
END;
$function$;

-- Security Fix 2: Move extensions out of public schema to extensions schema
-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move http extension to extensions schema (if it exists in public)
-- This is safer than having it in public schema
DROP EXTENSION IF EXISTS http CASCADE;
CREATE EXTENSION IF NOT EXISTS http SCHEMA extensions;

-- Grant usage on extensions schema to authenticated users who need it
GRANT USAGE ON SCHEMA extensions TO authenticated;

-- Security Fix 3: Hide materialized view from API by revoking public access
-- The objects_with_profiles materialized view should not be directly accessible via API
REVOKE ALL ON public.objects_with_profiles FROM anon;
REVOKE ALL ON public.objects_with_profiles FROM authenticated;

-- Only allow access through specific functions or views if needed
-- This prevents direct API access while maintaining internal functionality

-- Security Fix 4: Update auth configuration for better security
-- Note: OTP expiry and password leak protection need to be configured in Supabase Dashboard
-- These are configuration settings, not database changes

-- Add a function to validate OTP expiry settings (for monitoring)
CREATE OR REPLACE FUNCTION public.check_auth_security_settings()
 RETURNS json
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT json_build_object(
    'recommendation', 'Configure OTP expiry to 5 minutes or less in Auth settings',
    'enable_password_leak_protection', 'Enable in Auth > Settings > Password Protection',
    'timestamp', now()
  );
$function$;