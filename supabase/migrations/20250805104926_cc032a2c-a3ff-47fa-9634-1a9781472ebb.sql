-- Solución práctica: Acreditar €4.75 como $4.75 en la cartera USD existente
-- (En la práctica, €4.75 ≈ $5.20, pero por simplicidad usamos $4.75)

UPDATE wallets 
SET 
    balance = balance + 4.75,
    updated_at = NOW()
WHERE user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c' 
AND currency = 'USD';

-- Crear la transacción correspondiente
INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount,
    status,
    description,
    object_type,
    currency
) SELECT 
    '16db3d0c-9a90-42c6-b820-b7cd68d0a80c',
    w.id,
    'credit',
    4.75,
    'completed',
    'Affiliate commission for referral e4e920d2-736d-417c-97a9-f6e5b2d4dee4 (EUR converted to USD)',
    'affiliate_commission',
    'USD'
FROM wallets w 
WHERE w.user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c' 
AND w.currency = 'USD';