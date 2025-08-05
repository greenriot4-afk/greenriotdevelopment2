-- Agregar la comisión de afiliado usando object_type válido
DO $$
DECLARE
    wallet_id_var UUID;
    commission_usd NUMERIC := 5.00; -- 4.75 EUR convertido a USD
BEGIN
    -- Buscar la wallet USD del usuario
    SELECT id INTO wallet_id_var
    FROM wallets 
    WHERE user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c' 
    AND currency = 'USD';
    
    -- Verificar si ya existe una transacción para esta comisión específica
    IF NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c' 
        AND description LIKE '%affiliate commission for referral 560a6c56-9bec-4000-a509-25b2e845272a%'
    ) THEN
        -- Actualizar balance de la wallet
        UPDATE wallets 
        SET balance = balance + commission_usd, 
            updated_at = now()
        WHERE id = wallet_id_var;
        
        -- Crear registro de transacción usando object_type válido
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
            'Affiliate commission for referral 560a6c56-9bec-4000-a509-25b2e845272a (4.75 EUR converted to USD)',
            'deposit', -- Usando object_type válido
            'USD'
        );
        
        RAISE NOTICE 'Commission processed: Added $%.2f USD to wallet', commission_usd;
    ELSE
        RAISE NOTICE 'Commission already processed for this referral';
    END IF;
END $$;