-- Agregar campo market_id a la tabla objects para asociar productos con mercadillos
ALTER TABLE public.objects 
ADD COLUMN market_id UUID REFERENCES public.circular_markets(id) ON DELETE SET NULL;

-- Crear índice para mejorar consultas
CREATE INDEX idx_objects_market_id ON public.objects(market_id);

-- Actualizar política RLS para permitir que administradores de mercadillos gestionen productos
CREATE POLICY "Market owners can manage market products" 
ON public.objects 
FOR ALL
USING (
  market_id IS NOT NULL AND 
  market_id IN (
    SELECT id FROM public.circular_markets 
    WHERE user_id = auth.uid()
  )
);

-- Política para permitir ver productos de mercadillos
CREATE POLICY "Everyone can view market products" 
ON public.objects 
FOR SELECT 
USING (market_id IS NOT NULL);