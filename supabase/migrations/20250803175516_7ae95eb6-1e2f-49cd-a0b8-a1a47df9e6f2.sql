-- Add currency support to wallets and transactions tables

-- Add currency column to wallets table
ALTER TABLE public.wallets 
ADD COLUMN currency TEXT DEFAULT 'USD' NOT NULL;

-- Add currency column to transactions table  
ALTER TABLE public.transactions
ADD COLUMN currency TEXT DEFAULT 'USD' NOT NULL;

-- Create index for better performance on currency queries
CREATE INDEX idx_wallets_user_currency ON public.wallets(user_id, currency);
CREATE INDEX idx_transactions_user_currency ON public.transactions(user_id, currency);

-- Add check constraints to ensure valid currencies
ALTER TABLE public.wallets 
ADD CONSTRAINT check_valid_currency 
CHECK (currency IN ('USD', 'EUR'));

ALTER TABLE public.transactions
ADD CONSTRAINT check_valid_transaction_currency 
CHECK (currency IN ('USD', 'EUR'));

-- Update existing records to have USD currency
UPDATE public.wallets SET currency = 'USD' WHERE currency IS NULL;
UPDATE public.transactions SET currency = 'USD' WHERE currency IS NULL;

-- Create a function to get user wallet by currency
CREATE OR REPLACE FUNCTION public.get_or_create_wallet(p_user_id UUID, p_currency TEXT DEFAULT 'USD')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Update the atomic wallet balance function to support currency
CREATE OR REPLACE FUNCTION public.update_wallet_balance_atomic(
  p_wallet_id UUID, 
  p_amount NUMERIC, 
  p_transaction_type TEXT, 
  p_user_id UUID, 
  p_description TEXT, 
  p_object_type TEXT DEFAULT 'abandoned',
  p_currency TEXT DEFAULT 'USD'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  
  IF p_currency NOT IN ('USD', 'EUR') THEN
    RAISE EXCEPTION 'Invalid currency: %. Supported currencies: USD, EUR', p_currency;
  END IF;
  
  -- Sanitize description
  p_description := LEFT(TRIM(p_description), 500);
  
  -- Lock the wallet row for update to prevent race conditions
  SELECT balance INTO current_balance
  FROM wallets 
  WHERE id = p_wallet_id AND user_id = p_user_id AND currency = p_currency
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
    object_type,
    currency
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
    p_object_type,
    p_currency
  ) RETURNING id INTO transaction_id;
  
  -- Update wallet balance
  UPDATE wallets 
  SET 
    balance = new_balance,
    updated_at = now()
  WHERE id = p_wallet_id AND user_id = p_user_id AND currency = p_currency;
  
  -- Return result
  result := json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_balance,
    'new_balance', new_balance,
    'currency', p_currency
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE EXCEPTION 'Wallet update failed: %', SQLERRM;
END;
$$;