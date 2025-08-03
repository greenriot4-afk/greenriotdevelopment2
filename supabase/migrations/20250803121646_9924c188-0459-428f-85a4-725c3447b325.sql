-- Drop the problematic constraint that requires amount > 0
-- This constraint doesn't make sense for debit transactions which should be negative
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_amount_check;

-- Add a more logical constraint that allows negative amounts for debits/withdrawals
-- but ensures the amount is not zero
ALTER TABLE public.transactions ADD CONSTRAINT transactions_amount_not_zero_check 
CHECK (amount != 0);

-- Also need to update the type constraint to include the new transaction types used in the function
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('deposit', 'withdrawal', 'debit', 'credit'));