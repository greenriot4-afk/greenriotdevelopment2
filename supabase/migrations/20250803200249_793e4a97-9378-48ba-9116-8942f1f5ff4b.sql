-- Crear enum para los niveles de afiliado
CREATE TYPE public.affiliate_level AS ENUM ('level_1', 'level_2', 'level_3');

-- Agregar columna de nivel a la tabla affiliate_codes
ALTER TABLE public.affiliate_codes 
ADD COLUMN level affiliate_level NOT NULL DEFAULT 'level_3';

-- Agregar comentarios para documentar los porcentajes
COMMENT ON TYPE public.affiliate_level IS 'Niveles de afiliado: level_1 (100%), level_2 (50%), level_3 (25%)';
COMMENT ON COLUMN public.affiliate_codes.level IS 'Nivel del afiliado que determina el porcentaje de comisión: level_1=100%, level_2=50%, level_3=25%';

-- Crear función para obtener el porcentaje de comisión según el nivel
CREATE OR REPLACE FUNCTION public.get_affiliate_commission_percentage(affiliate_level affiliate_level)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT CASE affiliate_level
    WHEN 'level_1' THEN 1.00  -- 100%
    WHEN 'level_2' THEN 0.50  -- 50%
    WHEN 'level_3' THEN 0.25  -- 25%
    ELSE 0.25  -- Default a level_3
  END;
$$;

-- Agregar nivel a la tabla affiliate_commissions para tracking
ALTER TABLE public.affiliate_commissions
ADD COLUMN affiliate_level affiliate_level;

-- Actualizar registros existentes al nivel 3 por defecto
UPDATE public.affiliate_codes SET level = 'level_3' WHERE level IS NULL;
UPDATE public.affiliate_commissions SET affiliate_level = 'level_3' WHERE affiliate_level IS NULL;