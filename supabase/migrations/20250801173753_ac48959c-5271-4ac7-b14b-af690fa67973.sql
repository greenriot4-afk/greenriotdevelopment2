-- Create affiliate system tables
CREATE TABLE public.affiliate_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create referrals tracking table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_code TEXT NOT NULL,
  referred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  commission_paid BOOLEAN NOT NULL DEFAULT false,
  commission_amount NUMERIC DEFAULT 0,
  subscription_date TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id) -- Each user can only be referred once
);

-- Create commission tracking table  
CREATE TABLE public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed
  stripe_session_id TEXT,
  processed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.affiliate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_codes
CREATE POLICY "Users can view their own affiliate codes" 
ON public.affiliate_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own affiliate codes" 
ON public.affiliate_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate codes" 
ON public.affiliate_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Affiliates can view their referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = affiliate_user_id);

CREATE POLICY "System can insert referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update referrals" 
ON public.referrals 
FOR UPDATE 
USING (true);

-- RLS Policies for affiliate_commissions
CREATE POLICY "Affiliates can view their commissions" 
ON public.affiliate_commissions 
FOR SELECT 
USING (auth.uid() = affiliate_user_id);

CREATE POLICY "System can manage commissions" 
ON public.affiliate_commissions 
FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_affiliate_codes_user_id ON public.affiliate_codes(user_id);
CREATE INDEX idx_affiliate_codes_code ON public.affiliate_codes(code);
CREATE INDEX idx_referrals_affiliate_user_id ON public.referrals(affiliate_user_id);
CREATE INDEX idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX idx_referrals_code ON public.referrals(affiliate_code);
CREATE INDEX idx_commissions_affiliate_user_id ON public.affiliate_commissions(affiliate_user_id);