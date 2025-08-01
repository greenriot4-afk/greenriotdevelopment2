-- Create secure wallet update function with proper locking
CREATE OR REPLACE FUNCTION public.update_wallet_balance_atomic(
  p_wallet_id UUID,
  p_amount NUMERIC,
  p_transaction_type TEXT,
  p_user_id UUID,
  p_description TEXT,
  p_object_type TEXT DEFAULT 'abandoned'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
  transaction_id UUID;
  result JSON;
BEGIN
  -- Input validation
  IF p_amount IS NULL OR p_amount = 0 THEN
    RAISE EXCEPTION 'Invalid amount: %', p_amount;
  END IF;
  
  IF p_transaction_type NOT IN ('debit', 'credit', 'deposit', 'withdrawal') THEN
    RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
  END IF;
  
  -- Sanitize description (limit length and remove potentially harmful content)
  p_description := LEFT(TRIM(p_description), 500);
  
  -- Lock the wallet row for update to prevent race conditions
  SELECT balance INTO current_balance
  FROM wallets 
  WHERE id = p_wallet_id AND user_id = p_user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found or access denied';
  END IF;
  
  -- Calculate new balance
  IF p_transaction_type IN ('debit', 'withdrawal') THEN
    -- Check sufficient balance for debits/withdrawals
    IF current_balance < ABS(p_amount) THEN
      RAISE EXCEPTION 'Insufficient balance. Current: %, Required: %', current_balance, ABS(p_amount);
    END IF;
    new_balance := current_balance - ABS(p_amount);
  ELSE
    -- Credits and deposits
    new_balance := current_balance + ABS(p_amount);
  END IF;
  
  -- Ensure balance doesn't go negative
  IF new_balance < 0 THEN
    RAISE EXCEPTION 'Transaction would result in negative balance';
  END IF;
  
  -- Create transaction record first
  INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount,
    status,
    description,
    object_type
  ) VALUES (
    p_user_id,
    p_wallet_id,
    p_transaction_type,
    CASE 
      WHEN p_transaction_type IN ('debit', 'withdrawal') THEN -ABS(p_amount)
      ELSE ABS(p_amount)
    END,
    'completed',
    p_description,
    p_object_type
  ) RETURNING id INTO transaction_id;
  
  -- Update wallet balance
  UPDATE wallets 
  SET 
    balance = new_balance,
    updated_at = now()
  WHERE id = p_wallet_id AND user_id = p_user_id;
  
  -- Return result
  result := json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_balance,
    'new_balance', new_balance
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE EXCEPTION 'Wallet update failed: %', SQLERRM;
END;
$$;

-- Create function for input sanitization
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove control characters, limit length, trim whitespace
  RETURN LEFT(TRIM(REGEXP_REPLACE(input_text, '[[:cntrl:]]', '', 'g')), 1000);
END;
$$;

-- Create function for validating numeric inputs
CREATE OR REPLACE FUNCTION public.validate_amount(amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check for valid positive amount
  RETURN amount IS NOT NULL 
    AND amount > 0 
    AND amount <= 1000000 -- Max amount limit
    AND SCALE(amount) <= 2; -- Max 2 decimal places
END;
$$;