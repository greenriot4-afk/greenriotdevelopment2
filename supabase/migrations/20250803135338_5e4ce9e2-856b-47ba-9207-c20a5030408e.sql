-- Crear tabla para la wallet de la empresa (sin foreign key a usuarios)
CREATE TABLE IF NOT EXISTS public.company_wallet (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  balance NUMERIC NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar wallet de la empresa si no existe
INSERT INTO public.company_wallet (id, balance) 
VALUES ('00000000-0000-0000-0000-000000000001', 0.00) 
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS para la tabla
ALTER TABLE public.company_wallet ENABLE ROW LEVEL SECURITY;

-- Política para permitir que el sistema (edge functions) gestione la wallet de la empresa
CREATE POLICY "System can manage company wallet" ON public.company_wallet
FOR ALL
USING (true);

-- Función para actualizar el balance de la empresa de forma atómica
CREATE OR REPLACE FUNCTION public.update_company_wallet_balance_atomic(p_amount numeric, p_description text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
  result JSON;
BEGIN
  -- Input validation
  IF p_amount IS NULL OR p_amount = 0 THEN
    RAISE EXCEPTION 'Invalid amount: %', p_amount;
  END IF;
  
  -- Sanitize description
  p_description := LEFT(TRIM(p_description), 500);
  
  -- Lock the company wallet for update
  SELECT balance INTO current_balance
  FROM company_wallet 
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Company wallet not found';
  END IF;
  
  -- Calculate new balance (always add commission)
  new_balance := current_balance + ABS(p_amount);
  
  -- Update company wallet balance
  UPDATE company_wallet 
  SET 
    balance = new_balance,
    updated_at = now()
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  
  -- Return result
  result := json_build_object(
    'success', true,
    'previous_balance', current_balance,
    'new_balance', new_balance,
    'commission_added', ABS(p_amount)
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Company wallet update failed: %', SQLERRM;
END;
$function$;