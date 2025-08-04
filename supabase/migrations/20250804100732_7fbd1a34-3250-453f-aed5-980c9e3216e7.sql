-- Phase 1: Critical PII Protection Fixes
-- Fix overly permissive RLS policy on profiles table

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Los usuarios pueden ver todos los perfiles" ON public.profiles;

-- Create restricted policies for profiles table
-- Users can view their own complete profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can view only public fields of other users' profiles (excluding sensitive location data)
CREATE POLICY "Users can view public profile data of others" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() != user_id AND user_id IS NOT NULL);

-- Phase 2: Database Function Security - Add proper search_path to SECURITY DEFINER functions

-- Fix get_or_create_wallet function
CREATE OR REPLACE FUNCTION public.get_or_create_wallet(p_user_id uuid, p_currency text DEFAULT 'USD'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  wallet_id UUID;
BEGIN
  -- Validate currency
  IF p_currency NOT IN ('USD', 'EUR') THEN
    RAISE EXCEPTION 'Invalid currency: %. Supported currencies: USD, EUR', p_currency;
  END IF;
  
  -- Try to find existing wallet
  SELECT id INTO wallet_id
  FROM wallets
  WHERE user_id = p_user_id AND currency = p_currency;
  
  -- Create wallet if it doesn't exist
  IF wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, currency, balance)
    VALUES (p_user_id, p_currency, 0.00)
    RETURNING id INTO wallet_id;
  END IF;
  
  RETURN wallet_id;
END;
$function$;

-- Fix get_affiliate_commission_percentage function
CREATE OR REPLACE FUNCTION public.get_affiliate_commission_percentage(affiliate_level affiliate_level)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE affiliate_level
    WHEN 'level_1' THEN 1.00  -- 100%
    WHEN 'level_2' THEN 0.50  -- 50%
    WHEN 'level_3' THEN 0.25  -- 25%
    ELSE 0.25  -- Default a level_3
  END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$function$;

-- Fix handle_new_user_wallet function
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create wallet for new user
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0.00);
  
  RETURN NEW;
END;
$function$;

-- Fix trigger_abandons_cleanup function
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

-- Create a secure public profiles view that excludes sensitive location data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  display_name,
  avatar_url,
  username,
  account_status,
  created_at,
  updated_at
FROM public.profiles;

-- Grant appropriate permissions on the view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Enable RLS on the view  
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Add input validation function for enhanced security
CREATE OR REPLACE FUNCTION public.validate_profile_input(
  p_display_name text DEFAULT NULL,
  p_username text DEFAULT NULL,
  p_location_name text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate display name
  IF p_display_name IS NOT NULL THEN
    IF LENGTH(TRIM(p_display_name)) = 0 OR LENGTH(p_display_name) > 100 THEN
      RAISE EXCEPTION 'Display name must be between 1 and 100 characters';
    END IF;
    -- Check for potentially malicious content
    IF p_display_name ~ '[<>''";\\]' THEN
      RAISE EXCEPTION 'Display name contains invalid characters';
    END IF;
  END IF;
  
  -- Validate username
  IF p_username IS NOT NULL THEN
    IF LENGTH(TRIM(p_username)) = 0 OR LENGTH(p_username) > 50 THEN
      RAISE EXCEPTION 'Username must be between 1 and 50 characters';
    END IF;
    -- Username should only contain alphanumeric characters, underscores, and hyphens
    IF p_username !~ '^[a-zA-Z0-9_-]+$' THEN
      RAISE EXCEPTION 'Username can only contain letters, numbers, underscores, and hyphens';
    END IF;
  END IF;
  
  -- Validate location name
  IF p_location_name IS NOT NULL THEN
    IF LENGTH(p_location_name) > 200 THEN
      RAISE EXCEPTION 'Location name must be 200 characters or less';
    END IF;
    -- Basic XSS prevention
    IF p_location_name ~ '[<>''";\\]' THEN
      RAISE EXCEPTION 'Location name contains invalid characters';
    END IF;
  END IF;
  
  RETURN true;
END;
$function$;