-- Fix the object_type constraint to allow 'deposit'
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_object_type_check;

-- Add updated constraint that includes 'deposit'
ALTER TABLE public.transactions ADD CONSTRAINT transactions_object_type_check 
CHECK (object_type IN ('abandoned', 'found', 'deposit', 'withdrawal'));

-- Also fix any existing transactions that might have been created
UPDATE public.transactions 
SET object_type = 'deposit' 
WHERE type = 'deposit' AND object_type IS NULL;