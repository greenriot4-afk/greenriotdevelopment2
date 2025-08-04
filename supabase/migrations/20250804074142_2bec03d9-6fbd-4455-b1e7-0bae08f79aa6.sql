-- Crear referral retroactivo para el caso de prueba
INSERT INTO referrals (affiliate_user_id, referred_user_id, affiliate_code, referred_at) 
VALUES (
  '16db3d0c-9a90-42c6-b820-b7cd68d0a80c', 
  'a4519d5b-21fc-4759-8687-0731b95d5763', 
  '1ZCNA7C8',
  '2025-08-04 07:30:06'::timestamptz
);

-- Procesar la comisión de afiliado para este referral
-- Primero obtener información de la suscripción
WITH subscription_info AS (
  SELECT 
    s.user_id,
    s.subscription_tier,
    CASE 
      WHEN s.subscription_tier = 'Premium' THEN 19.00
      WHEN s.subscription_tier = 'Basic' THEN 9.99
      ELSE 0
    END as subscription_amount
  FROM subscribers s
  WHERE s.user_id = 'a4519d5b-21fc-4759-8687-0731b95d5763'
    AND s.subscribed = true
),
affiliate_info AS (
  SELECT 
    ac.level,
    CASE 
      WHEN ac.level = 'level_1' THEN 1.00  -- 100%
      WHEN ac.level = 'level_2' THEN 0.50  -- 50%
      WHEN ac.level = 'level_3' THEN 0.25  -- 25%
      ELSE 0.25
    END as commission_percentage
  FROM affiliate_codes ac
  WHERE ac.code = '1ZCNA7C8'
),
commission_calc AS (
  SELECT 
    si.user_id,
    si.subscription_amount,
    ai.commission_percentage,
    (si.subscription_amount * ai.commission_percentage) as commission_amount,
    ai.level as affiliate_level
  FROM subscription_info si
  CROSS JOIN affiliate_info ai
)
-- Insertar la comisión calculada
INSERT INTO affiliate_commissions (
  affiliate_user_id, 
  referral_id, 
  amount, 
  status, 
  affiliate_level,
  processed_at
)
SELECT 
  '16db3d0c-9a90-42c6-b820-b7cd68d0a80c',
  r.id,
  cc.commission_amount,
  'pending',
  cc.affiliate_level,
  now()
FROM referrals r
CROSS JOIN commission_calc cc
WHERE r.affiliate_code = '1ZCNA7C8' 
  AND r.referred_user_id = 'a4519d5b-21fc-4759-8687-0731b95d5763'
  AND NOT EXISTS (
    SELECT 1 FROM affiliate_commissions ac2 
    WHERE ac2.referral_id = r.id
  );

-- Actualizar el referral para marcar que la comisión fue pagada
UPDATE referrals 
SET 
  commission_paid = true,
  commission_amount = (
    SELECT (19.00 * 0.25) -- Premium subscription amount * level_3 percentage
  ),
  subscription_date = now()
WHERE affiliate_code = '1ZCNA7C8' 
  AND referred_user_id = 'a4519d5b-21fc-4759-8687-0731b95d5763';

-- Actualizar el balance de la wallet del afiliado
UPDATE wallets 
SET balance = balance + 4.75  -- 19.00 * 0.25 = 4.75
WHERE user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c';

-- Marcar la comisión como pagada
UPDATE affiliate_commissions 
SET 
  status = 'paid',
  processed_at = now()
WHERE affiliate_user_id = '16db3d0c-9a90-42c6-b820-b7cd68d0a80c'
  AND referral_id = (
    SELECT id FROM referrals 
    WHERE affiliate_code = '1ZCNA7C8' 
      AND referred_user_id = 'a4519d5b-21fc-4759-8687-0731b95d5763'
  );