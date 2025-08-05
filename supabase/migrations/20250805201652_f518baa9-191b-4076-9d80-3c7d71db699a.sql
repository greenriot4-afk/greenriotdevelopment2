-- Insertar el registro de referido faltante para el usuario afiliate4
INSERT INTO referrals (
  affiliate_user_id,
  referred_user_id,
  affiliate_code,
  referred_at,
  commission_paid,
  subscription_date,
  commission_amount
) VALUES (
  '16db3d0c-9a90-42c6-b820-b7cd68d0a80c', -- inigoloperena user_id
  '6bee3c1b-40ca-4b20-8380-102b4e939fd4', -- afiliate4 user_id  
  '1ZCNA7C8', -- código de afiliado de inigoloperena
  '2025-08-05 20:10:00+00', -- fecha aproximada de registro
  false, -- aún no se ha pagado la comisión
  '2025-08-05 20:11:16+00', -- fecha de suscripción
  0 -- se calculará después
);