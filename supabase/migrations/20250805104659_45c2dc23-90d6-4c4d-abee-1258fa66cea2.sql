-- Procesar la comisión de afiliado manualmente para el referral de Javi
DO $$
DECLARE
    referral_record RECORD;
    commission_amount NUMERIC := 4.75;
    wallet_id_var UUID;
    current_balance NUMERIC := 0;
    new_balance NUMERIC;
BEGIN
    -- 1. Obtener el referral
    SELECT * INTO referral_record 
    FROM referrals 
    WHERE id = 'e4e920d2-736d-417c-97a9-f6e5b2d4dee4' 
    AND commission_paid = false;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Referral not found or already paid';
    END IF;
    
    RAISE NOTICE 'Processing referral for user %', referral_record.affiliate_user_id;
    
    -- 2. Actualizar el referral como pagado
    UPDATE referrals 
    SET 
        commission_paid = true,
        commission_amount = commission_amount,
        subscription_date = NOW()
    WHERE id = referral_record.id;
    
    RAISE NOTICE 'Referral updated as paid';
    
    -- 3. Crear registro de comisión
    INSERT INTO affiliate_commissions (
        affiliate_user_id,
        referral_id,
        amount,
        status,
        stripe_session_id,
        affiliate_level,
        processed_at
    ) VALUES (
        referral_record.affiliate_user_id,
        referral_record.id,
        commission_amount,
        'paid',
        'manual_sql_processing',
        'level_3',
        NOW()
    );
    
    RAISE NOTICE 'Commission record created';
    
    -- 4. Obtener o crear cartera EUR
    SELECT id, balance INTO wallet_id_var, current_balance
    FROM wallets 
    WHERE user_id = referral_record.affiliate_user_id 
    AND currency = 'EUR';
    
    IF NOT FOUND THEN
        -- Crear nueva cartera EUR
        INSERT INTO wallets (user_id, currency, balance)
        VALUES (referral_record.affiliate_user_id, 'EUR', 0)
        RETURNING id, balance INTO wallet_id_var, current_balance;
        
        RAISE NOTICE 'New EUR wallet created: %', wallet_id_var;
    ELSE
        RAISE NOTICE 'Existing EUR wallet found: %, balance: %', wallet_id_var, current_balance;
    END IF;
    
    -- 5. Actualizar balance de la cartera
    new_balance := current_balance + commission_amount;
    
    UPDATE wallets 
    SET 
        balance = new_balance,
        updated_at = NOW()
    WHERE id = wallet_id_var;
    
    RAISE NOTICE 'Wallet balance updated from % to %', current_balance, new_balance;
    
    -- 6. Crear transacción
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
        referral_record.affiliate_user_id,
        wallet_id_var,
        'credit',
        commission_amount,
        'completed',
        'Affiliate commission for referral ' || referral_record.id,
        'affiliate_commission',
        'EUR'
    );
    
    RAISE NOTICE 'Transaction created successfully';
    RAISE NOTICE 'Commission of €% processed successfully for user %', commission_amount, referral_record.affiliate_user_id;
    
END $$;