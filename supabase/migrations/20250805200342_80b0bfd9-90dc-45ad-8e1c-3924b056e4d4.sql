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

-- Añadir la comisión al wallet del afiliado
-- Primero obtener o crear el wallet
DO $$
DECLARE
    wallet_id UUID;
    affiliate_user_id UUID := '16db3d0c-9a90-42c6-b820-b7cd68d0a80c';
    commission_amount NUMERIC := 4.75;
BEGIN
    -- Obtener el wallet del usuario afiliado
    SELECT id INTO wallet_id 
    FROM wallets 
    WHERE user_id = affiliate_user_id AND currency = 'USD';
    
    -- Si no existe wallet, crearlo
    IF wallet_id IS NULL THEN
        INSERT INTO wallets (user_id, currency, balance)
        VALUES (affiliate_user_id, 'USD', 0.00)
        RETURNING id INTO wallet_id;
    END IF;
    
    -- Actualizar el balance del wallet
    UPDATE wallets 
    SET balance = balance + commission_amount
    WHERE id = wallet_id;
    
    -- Crear el registro de transacción
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
        affiliate_user_id,
        wallet_id,
        'credit',
        commission_amount,
        'completed',
        'Comisión de afiliado - referral testafi2@gmail.com',
        'commission',
        'USD'
    );
END $$;