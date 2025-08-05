-- Security Enhancements Migration
-- 1. Add security audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id_param UUID DEFAULT NULL,
  details JSONB DEFAULT '{}'::jsonb
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log security events for monitoring
  INSERT INTO auth.audit_log_entries (
    instance_id,
    id,
    payload,
    created_at,
    ip_address
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    jsonb_build_object(
      'event_type', event_type,
      'user_id', COALESCE(user_id_param, auth.uid()),
      'details', details,
      'timestamp', now()
    ),
    now(),
    inet_client_addr()
  );
END;
$$;

-- 2. Enhanced privilege escalation protection
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admin role assignment by existing admins
  IF NEW.role = 'admin' AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    -- Log the attempt
    PERFORM log_security_event(
      'unauthorized_admin_assignment_attempt',
      auth.uid(),
      jsonb_build_object('target_user', NEW.user_id, 'attempted_role', NEW.role)
    );
    RAISE EXCEPTION 'Unauthorized attempt to assign admin role';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Create trigger for privilege escalation protection
DROP TRIGGER IF EXISTS trigger_prevent_privilege_escalation ON user_roles;
CREATE TRIGGER trigger_prevent_privilege_escalation
  BEFORE INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_privilege_escalation();

-- 4. Enhanced wallet security function
CREATE OR REPLACE FUNCTION public.secure_wallet_transaction(
  p_user_id UUID,
  p_amount NUMERIC,
  p_transaction_type TEXT,
  p_description TEXT,
  p_currency TEXT DEFAULT 'USD'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  wallet_id_var UUID;
  result JSONB;
  rate_limit_key TEXT;
  recent_transactions INTEGER;
BEGIN
  -- Input validation
  IF NOT validate_amount(p_amount) THEN
    RAISE EXCEPTION 'Invalid amount: %', p_amount;
  END IF;
  
  -- Rate limiting: max 10 transactions per minute per user
  rate_limit_key := 'wallet_tx_' || p_user_id::TEXT;
  SELECT COUNT(*) INTO recent_transactions
  FROM transactions
  WHERE user_id = p_user_id 
    AND created_at > now() - INTERVAL '1 minute';
    
  IF recent_transactions >= 10 THEN
    PERFORM log_security_event(
      'wallet_rate_limit_exceeded',
      p_user_id,
      jsonb_build_object('recent_count', recent_transactions)
    );
    RAISE EXCEPTION 'Rate limit exceeded. Too many transactions in the last minute.';
  END IF;
  
  -- Get or create wallet
  wallet_id_var := get_or_create_wallet(p_user_id, p_currency);
  
  -- Execute transaction using atomic function
  result := update_wallet_balance_atomic(
    wallet_id_var,
    p_amount,
    p_transaction_type,
    p_user_id,
    sanitize_text_input(p_description),
    'secure_transaction',
    p_currency
  );
  
  -- Log successful transaction
  PERFORM log_security_event(
    'wallet_transaction_completed',
    p_user_id,
    jsonb_build_object(
      'amount', p_amount,
      'type', p_transaction_type,
      'currency', p_currency,
      'wallet_id', wallet_id_var
    )
  );
  
  RETURN result;
END;
$$;

-- 5. Enhanced input validation for profiles
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_profile(
  p_display_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_location_name TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB := '{}'::jsonb;
BEGIN
  -- Sanitize and validate display name
  IF p_display_name IS NOT NULL THEN
    p_display_name := sanitize_text_input(p_display_name);
    IF NOT validate_profile_input(p_display_name) THEN
      RAISE EXCEPTION 'Invalid display name';
    END IF;
    result := jsonb_set(result, '{display_name}', to_jsonb(p_display_name));
  END IF;
  
  -- Sanitize and validate username
  IF p_username IS NOT NULL THEN
    p_username := sanitize_text_input(p_username);
    IF NOT validate_profile_input(NULL, p_username) THEN
      RAISE EXCEPTION 'Invalid username';
    END IF;
    result := jsonb_set(result, '{username}', to_jsonb(p_username));
  END IF;
  
  -- Sanitize and validate location
  IF p_location_name IS NOT NULL THEN
    p_location_name := sanitize_text_input(p_location_name);
    IF NOT validate_profile_input(NULL, NULL, p_location_name) THEN
      RAISE EXCEPTION 'Invalid location name';
    END IF;
    result := jsonb_set(result, '{location_name}', to_jsonb(p_location_name));
  END IF;
  
  RETURN result;
END;
$$;

-- 6. Security monitoring function
CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
  admin_count INTEGER;
  recent_failed_logins INTEGER;
  suspicious_activities INTEGER;
BEGIN
  -- Count admins
  SELECT COUNT(*) INTO admin_count
  FROM user_roles
  WHERE role = 'admin';
  
  -- Check for recent failed login attempts (if available)
  recent_failed_logins := 0; -- Placeholder
  
  -- Check for suspicious activities
  SELECT COUNT(*) INTO suspicious_activities
  FROM transactions
  WHERE created_at > now() - INTERVAL '1 hour'
    AND amount > 1000;
  
  result := jsonb_build_object(
    'timestamp', now(),
    'admin_count', admin_count,
    'recent_failed_logins', recent_failed_logins,
    'suspicious_high_value_transactions', suspicious_activities,
    'security_level', CASE
      WHEN admin_count = 0 THEN 'CRITICAL'
      WHEN admin_count > 5 THEN 'WARNING'
      WHEN suspicious_activities > 10 THEN 'ALERT'
      ELSE 'NORMAL'
    END,
    'recommendations', CASE
      WHEN admin_count = 0 THEN jsonb_build_array('No administrators found - assign admin role immediately')
      WHEN admin_count > 5 THEN jsonb_build_array('Too many administrators - review admin assignments')
      WHEN suspicious_activities > 10 THEN jsonb_build_array('High value transaction activity detected - review recent transactions')
      ELSE jsonb_build_array('Security status normal')
    END
  );
  
  RETURN result;
END;
$$;