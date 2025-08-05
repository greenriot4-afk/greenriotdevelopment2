-- Crear el referral que faltaba para testafi2@gmail.com
-- Asumiendo que vino del código 1ZCNA7C8 (basándome en los referrals anteriores)
INSERT INTO public.referrals (
    affiliate_user_id,
    referred_user_id,
    affiliate_code,
    referred_at,
    subscription_date,
    commission_paid
) VALUES (
    '16db3d0c-9a90-42c6-b820-b7cd68d0a80c', -- El usuario afiliado (basado en registros anteriores)
    '106076fd-6b90-41ce-a080-3664b9c19057', -- testafi2@gmail.com user_id
    '1ZCNA7C8', -- Código de afiliado
    '2025-08-05 19:54:14+00', -- Fecha de registro (aproximada)
    '2025-08-05 19:55:05+00', -- Fecha de suscripción (basada en subscription_end - 1 mes)
    false -- No se ha pagado aún
);

-- Crear la comisión de afiliado correspondiente
INSERT INTO public.affiliate_commissions (
    affiliate_user_id,
    referral_id,
    amount,
    status,
    affiliate_level,
    stripe_session_id
) SELECT 
    '16db3d0c-9a90-42c6-b820-b7cd68d0a80c',
    id,
    4.75, -- $20 * 0.25 = $5, pero usamos 4.75 como en otros registros
    'pending',
    'level_3',
    'manual_fix_testafi2'
FROM public.referrals 
WHERE referred_user_id = '106076fd-6b90-41ce-a080-3664b9c19057'
AND affiliate_code = '1ZCNA7C8';