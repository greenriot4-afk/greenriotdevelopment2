-- Crear wallet EUR para inigoloperena si no existe
INSERT INTO wallets (user_id, currency, balance)
SELECT '16db3d0c-9a90-42c6-b820-b7cd68d0a80c', 'EUR', 4.75
WHERE NOT EXISTS (
  SELECT 1 FROM wallets 
  WHERE user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c' 
  AND currency = 'EUR'
);

-- Si ya existe, actualizar el balance sumando la comisión
UPDATE wallets 
SET balance = balance + 4.75, 
    updated_at = now()
WHERE user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c' 
  AND currency = 'EUR'
  AND NOT EXISTS (
    SELECT 1 FROM transactions 
    WHERE user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c' 
    AND description LIKE '%affiliate commission for referral 560a6c56-9bec-4000-a509-25b2e845272a%'
  );