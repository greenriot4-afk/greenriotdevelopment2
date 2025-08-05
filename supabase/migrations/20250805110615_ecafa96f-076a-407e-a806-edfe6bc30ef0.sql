-- Solo crear lo necesario sin problemas de constraint

-- Crear el referral que debería haberse creado automáticamente
INSERT INTO referrals (
    affiliate_user_id, 
    referred_user_id, 
    affiliate_code, 
    referred_at, 
    commission_paid,
    commission_amount,
    subscription_date,
    created_at
) VALUES (
    'aa721fce-527c-4f64-9d97-af361b1feb0a', -- loperenix (affiliate)
    '7dd0bff3-8009-498d-a1a8-08334d02042b', -- jaime (referred)
    '8SC05LTX', -- código de loperenix
    '2025-08-05 10:54:00+00', -- fecha estimada de registro
    true, -- marcamos como pagado
    4.75, -- comisión estándar €4.75
    '2025-08-05 10:54:48+00', -- fecha de suscripción de jaime
    '2025-08-05 10:54:00+00'
);

-- Crear registro de comisión
INSERT INTO affiliate_commissions (
    affiliate_user_id,
    referral_id,
    amount,
    status,
    stripe_session_id,
    affiliate_level,
    processed_at,
    created_at
) SELECT 
    'aa721fce-527c-4f64-9d97-af361b1feb0a',
    r.id,
    4.75,
    'paid',
    'manual_fix_jaime_referral',
    'level_3',
    NOW(),
    NOW()
FROM referrals r 
WHERE r.affiliate_user_id = 'aa721fce-527c-4f64-9d97-af361b1feb0a' 
AND r.referred_user_id = '7dd0bff3-8009-498d-a1a8-08334d02042b';

-- Actualizar wallet existente USD con la comisión  
UPDATE wallets 
SET 
    balance = balance + 4.75,
    updated_at = NOW()
WHERE user_id = 'aa721fce-527c-4f64-9d97-af361b1feb0a' 
AND currency = 'USD';

-- Crear transacción de comisión usando object_type permitido
INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount,
    status,
    description,
    object_type,
    currency,
    created_at
) SELECT 
    'aa721fce-527c-4f64-9d97-af361b1feb0a',
    w.id,
    'credit',
    4.75,
    'completed',
    'Affiliate commission for referring jaime@gmail.com',
    'deposit',
    'USD',
    NOW()
FROM wallets w 
WHERE w.user_id = 'aa721fce-527c-4f64-9d97-af361b1feb0a' 
AND w.currency = 'USD';