-- Fix the transactions constraint to include 'coordinate' and other object types
ALTER TABLE public.transactions DROP CONSTRAINT transactions_object_type_check;

-- Add updated constraint with all needed object types
ALTER TABLE public.transactions ADD CONSTRAINT transactions_object_type_check 
  CHECK (object_type::text = ANY (ARRAY[
    'abandoned'::character varying, 
    'found'::character varying, 
    'deposit'::character varying, 
    'withdrawal'::character varying,
    'coordinate'::character varying,
    'coordinate_sale'::character varying,
    'donation'::character varying,
    'product'::character varying
  ]::text[]));

-- Add indexes for better performance on objects table
CREATE INDEX IF NOT EXISTS idx_objects_type_is_sold ON public.objects(type, is_sold);
CREATE INDEX IF NOT EXISTS idx_objects_created_at ON public.objects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_objects_user_id ON public.objects(user_id);

-- Add index for transactions performance  
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);

-- Add index for profiles lookup
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);