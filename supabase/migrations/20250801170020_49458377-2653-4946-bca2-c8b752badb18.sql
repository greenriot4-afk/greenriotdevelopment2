-- Crear tabla de suscripciones para trackear el estado de los usuarios
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para suscripciones
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Agregar campos para Stripe en transactions
ALTER TABLE public.transactions 
ADD COLUMN stripe_payment_intent_id TEXT,
ADD COLUMN stripe_transfer_id TEXT,
ADD COLUMN platform_fee NUMERIC DEFAULT 0;

-- Actualizar trigger de wallet creation para incluir suscripción
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Create wallet for new user
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0.00);
  
  -- Create subscriber record
  INSERT INTO public.subscribers (user_id, email, subscribed)
  VALUES (NEW.id, NEW.email, false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear nuevo trigger que reemplace el anterior
DROP TRIGGER IF EXISTS handle_new_user_wallet ON auth.users;
CREATE TRIGGER handle_new_user_complete
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_complete();