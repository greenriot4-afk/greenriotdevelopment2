-- Create connected_accounts table to track Stripe Express accounts
CREATE TABLE public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id TEXT UNIQUE,
  account_status TEXT NOT NULL DEFAULT 'pending',
  onboarding_url TEXT,
  dashboard_url TEXT,
  capabilities JSONB DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own connected account
CREATE POLICY "Users can view their own connected account" 
ON public.connected_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own connected account
CREATE POLICY "Users can insert their own connected account" 
ON public.connected_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- System can update connected accounts
CREATE POLICY "System can update connected accounts" 
ON public.connected_accounts 
FOR UPDATE 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_connected_accounts_updated_at
BEFORE UPDATE ON public.connected_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add account_status to profiles table to track seller status
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'not_connected';

-- Update existing users to not_connected status
UPDATE public.profiles 
SET account_status = 'not_connected' 
WHERE account_status IS NULL;