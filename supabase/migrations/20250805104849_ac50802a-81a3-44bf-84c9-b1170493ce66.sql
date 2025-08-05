-- Completar el procesamiento de la comisión - enfoque directo
INSERT INTO wallets (user_id, currency, balance)
VALUES ('16db3d0c-9a90-42c6-b820-b7cd68d0a80c', 'EUR', 4.75);

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
    'Affiliate commission for referral e4e920d2-736d-417c-97a9-f6e5b2d4dee4',
    'affiliate_commission',
    'EUR'
FROM wallets w 
WHERE w.user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c' 
AND w.currency = 'EUR';