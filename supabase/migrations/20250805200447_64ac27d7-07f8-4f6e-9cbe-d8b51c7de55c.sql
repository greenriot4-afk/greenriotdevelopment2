-- Procesar manualmente la comisión de afiliado pendiente
UPDATE public.affiliate_commissions 
SET 
    status = 'paid',
    processed_at = now()
WHERE id = '5103540f-7b2e-46c7-b597-9a6189b52373';

-- Actualizar el referral como pagado
UPDATE public.referrals 
SET commission_paid = true
WHERE id = 'cf3ec21a-167c-45bf-9615-b48d81be2fb6';

-- Añadir la comisión al wallet del afiliado usando la función atomic existente
SELECT update_wallet_balance_atomic(
    (SELECT id FROM wallets WHERE user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c' AND currency = 'USD' LIMIT 1),
    4.75,
    'credit',
    '16db3d0c-9a90-42c6-b820-b7cd68d0a80c',
    'Comisión de afiliado - referral testafi2@gmail.com',
    'abandoned',
    'USD'
);