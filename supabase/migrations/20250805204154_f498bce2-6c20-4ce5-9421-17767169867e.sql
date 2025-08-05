-- Crear referencia faltante para afiliate7 y procesar comisión de afiliado
DO $$
DECLARE
    referral_id_var UUID;
    commission_id_var UUID;
    wallet_id_var UUID;
    commission_usd NUMERIC := 5.00; -- 25% de $20 Premium
BEGIN
    -- Crear registro de referencia faltante
    INSERT INTO referrals (
        id,
        affiliate_user_id,
        referred_user_id,
        affiliate_code,
        referred_at,
        subscription_date,
        commission_paid,
        commission_amount
    ) VALUES (
        gen_random_uuid(),
        '16db3d0c-9a90-42c6-b820-b7cd68d0a80c', -- inigoloperena@gmail.com
        'f61422aa-487d-4e54-a80a-1fe814082e4a', -- afiliate7@gmail.com
        '1ZCNA7C8',
        '2025-08-05 20:33:38+00'::timestamptz, -- Fecha de creación de la cuenta
        '2025-08-05 20:34:02+00'::timestamptz, -- Fecha de suscripción
        true,
        commission_usd
    ) RETURNING id INTO referral_id_var;

    -- Crear comisión de afiliado
    INSERT INTO affiliate_commissions (
        affiliate_user_id,
        referral_id,
        amount,
        status,
        processed_at,
        affiliate_level,
        stripe_session_id
    ) VALUES (
        '16db3d0c-9a90-42c6-b820-b7cd68d0a80c',
        referral_id_var,
        commission_usd,
        'paid',
        now(),
        'level_3',
        'manual_fix_afiliate7'
    ) RETURNING id INTO commission_id_var;

    -- Buscar la wallet USD del usuario afiliado
    SELECT id INTO wallet_id_var
    FROM wallets 
    WHERE user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c' 
    AND currency = 'USD';
    
    -- Actualizar balance de la wallet
    UPDATE wallets 
    SET balance = balance + commission_usd, 
        updated_at = now()
    WHERE id = wallet_id_var;
    
    -- Crear registro de transacción
    INSERT INTO transactions (
        user_id,
        wallet_id,
        type,
        amount,
        status,
        description,
        object_type,
        currency
    ) VALUES (
        '16db3d0c-9a90-42c6-b820-b7cd68d0a80c',
        wallet_id_var,
        'credit',
        commission_usd,
        'completed',
        'Affiliate commission for referral afiliate7@gmail.com Premium subscription',
        'deposit',
        'USD'
    );
    
    RAISE NOTICE 'Referral and commission processed successfully for afiliate7';
    RAISE NOTICE 'Referral ID: %', referral_id_var;
    RAISE NOTICE 'Commission ID: %', commission_id_var;
    RAISE NOTICE 'Commission amount: $%.2f USD', commission_usd;
END $$;