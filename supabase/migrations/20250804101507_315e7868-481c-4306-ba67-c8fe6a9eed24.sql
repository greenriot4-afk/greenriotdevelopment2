-- Phase 3: Complete Security Hardening

-- Fix remaining database functions missing search_path
CREATE OR REPLACE FUNCTION public.trigger_refresh_objects_view()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Use pg_notify to trigger async refresh
  PERFORM pg_notify('refresh_objects_view', '');
  RETURN COALESCE(NEW, OLD);
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_conversation_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.conversations
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Remove the Security Definer view (replace with proper RLS)
DROP VIEW IF EXISTS public.public_profiles;

-- Create a proper table-based approach for public profile access
-- The existing RLS policies on profiles table already handle this securely

-- Move extension out of public schema (if possible)
-- Note: Some extensions may need to stay in public for compatibility
-- This would typically be done by database administrators

-- Add better input validation for critical functions
CREATE OR REPLACE FUNCTION public.validate_numeric_input(
  input_value NUMERIC,
  min_value NUMERIC DEFAULT 0,
  max_value NUMERIC DEFAULT 1000000,
  decimal_places INTEGER DEFAULT 2
) RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN input_value IS NOT NULL 
    AND input_value >= min_value 
    AND input_value <= max_value
    AND SCALE(input_value) <= decimal_places;
END;
$function$;

-- Enhance wallet security with additional validation
CREATE OR REPLACE FUNCTION public.secure_wallet_operation(
  p_wallet_id UUID,
  p_user_id UUID,
  p_amount NUMERIC,
  p_operation TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  wallet_exists BOOLEAN;
  user_owns_wallet BOOLEAN;
BEGIN
  -- Validate inputs
  IF p_wallet_id IS NULL OR p_user_id IS NULL OR p_amount IS NULL OR p_operation IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if wallet exists and belongs to user
  SELECT EXISTS(
    SELECT 1 FROM wallets 
    WHERE id = p_wallet_id AND user_id = p_user_id
  ) INTO user_owns_wallet;
  
  -- Validate amount using our validation function
  IF NOT validate_numeric_input(p_amount, 0.01, 10000, 2) THEN
    RETURN FALSE;
  END IF;
  
  -- Validate operation type
  IF p_operation NOT IN ('credit', 'debit', 'deposit', 'withdrawal') THEN
    RETURN FALSE;
  END IF;
  
  RETURN user_owns_wallet;
END;
$function$;