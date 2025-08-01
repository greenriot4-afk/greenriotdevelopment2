-- Create circular_markets table for garage sales and second-hand shops
CREATE TABLE public.circular_markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_name TEXT,
  accepts_donations BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on circular_markets table
ALTER TABLE public.circular_markets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for circular_markets
CREATE POLICY "Everyone can view active markets" 
ON public.circular_markets 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can insert their own markets" 
ON public.circular_markets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own markets" 
ON public.circular_markets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own markets" 
ON public.circular_markets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating market timestamps
CREATE TRIGGER update_circular_markets_updated_at
BEFORE UPDATE ON public.circular_markets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_circular_markets_user_id ON public.circular_markets(user_id);
CREATE INDEX idx_circular_markets_location ON public.circular_markets(latitude, longitude);
CREATE INDEX idx_circular_markets_active ON public.circular_markets(is_active);
CREATE INDEX idx_circular_markets_created_at ON public.circular_markets(created_at DESC);