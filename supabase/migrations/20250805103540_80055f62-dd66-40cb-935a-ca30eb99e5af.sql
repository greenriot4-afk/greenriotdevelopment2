-- Crear el registro de referral que falta para el usuario Javi
INSERT INTO public.referrals (
  affiliate_user_id,
  referred_user_id,
  affiliate_code,
  referred_at,
  commission_paid,
  commission_amount
) VALUES (
  '16db3d0c-9a90-42c6-b820-b7cd68d0a80c',  -- Usuario Inigo1 (el afiliado)
  '0fb03d2a-0c0d-4576-aa7f-52d565c6e165',  -- Usuario Javi (el referido)
  '1ZCNA7C8',                              -- Código de afiliado de Inigo1
  NOW() - INTERVAL '1 day',                -- Fecha de referido (ayer)
  false,                                   -- Comisión no pagada aún
  0                                        -- Cantidad inicial
);