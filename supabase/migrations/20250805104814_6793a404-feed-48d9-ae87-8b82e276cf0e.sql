-- Completar el procesamiento de la comisión de afiliado
DO $$
DECLARE
    affiliate_user_id_var UUID := '16db3d0c-9a90-42c6-b820-b7cd68d0a80c';
    commission_amount NUMERIC := 4.75;
    referral_id_var UUID := 'e4e920d2-736d-417c-97a9-f6e5b2d4dee4';
    wallet_id_var UUID;
    current_balance NUMERIC := 0;
    new_balance NUMERIC;
BEGIN
    RAISE NOTICE 'Completing commission processing for user %', affiliate_user_id_var;
    
    -- 1. Crear cartera EUR si no existe
    SELECT id, balance INTO wallet_id_var, current_balance
    FROM wallets 
    WHERE user_id = affiliate_user_id_var 
    AND currency = 'EUR';
    
    IF NOT FOUND THEN
        -- Crear nueva cartera EUR
        INSERT INTO wallets (user_id, currency, balance)
        VALUES (affiliate_user_id_var, 'EUR', 0)
        RETURNING id, balance INTO wallet_id_var, current_balance;
        
        RAISE NOTICE 'New EUR wallet created: %', wallet_id_var;
    ELSE
        RAISE NOTICE 'Existing EUR wallet found: %, balance: %', wallet_id_var, current_balance;
    END IF;
    
    -- 2. Verificar si ya existe una transacción para esta comisión
    IF NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE user_id = affiliate_user_id_var 
        AND currency = 'EUR' 
        AND object_type = 'affiliate_commission'
        AND description LIKE '%' || referral_id_var || '%'
    ) THEN
        -- 3. Actualizar balance de la cartera
        new_balance := current_balance + commission_amount;
        
        UPDATE wallets 
        SET 
            balance = new_balance,
            updated_at = NOW()
        WHERE id = wallet_id_var;
        
        RAISE NOTICE 'Wallet balance updated from % to %', current_balance, new_balance;
        
        -- 4. Crear transacción
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
            affiliate_user_id_var,
            wallet_id_var,
            'credit',
            commission_amount,
            'completed',
            'Affiliate commission for referral ' || referral_id_var,
            'affiliate_commission',
            'EUR'
        );
        
        RAISE NOTICE 'Transaction created successfully';
        RAISE NOTICE 'Commission of €% credited to wallet. New balance: €%', commission_amount, new_balance;
    ELSE
        RAISE NOTICE 'Transaction already exists for this commission';
    END IF;
    
END $$;