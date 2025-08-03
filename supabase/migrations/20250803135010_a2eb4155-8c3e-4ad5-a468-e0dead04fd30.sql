-- Crear wallet de la empresa para recibir comisiones
-- Usaremos un UUID fijo para la empresa
INSERT INTO public.wallets (id, user_id, balance, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',  -- UUID fijo para la empresa
  '00000000-0000-0000-0000-000000000000',  -- User ID especial para la empresa
  0.00,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Crear política especial para permitir que el sistema actualice la wallet de la empresa
CREATE POLICY "System can manage company wallet" ON public.wallets
FOR ALL
USING (id = '00000000-0000-0000-0000-000000000001'::uuid);