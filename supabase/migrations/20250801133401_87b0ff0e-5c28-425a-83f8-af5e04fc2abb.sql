-- Add object_type column to support different types of objects
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS object_type VARCHAR(20) DEFAULT 'abandoned' CHECK (object_type IN ('abandoned', 'donation', 'product'));

-- Create a new table for objects (abandons, donations, products)
CREATE TABLE public.objects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('abandoned', 'donation', 'product')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  price_credits INTEGER DEFAULT 0,
  is_sold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on objects table
ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for objects
CREATE POLICY "Everyone can view objects" 
ON public.objects 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own objects" 
ON public.objects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own objects" 
ON public.objects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own objects" 
ON public.objects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating object timestamps
CREATE TRIGGER update_objects_updated_at
BEFORE UPDATE ON public.objects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_objects_user_id ON public.objects(user_id);
CREATE INDEX idx_objects_type ON public.objects(type);
CREATE INDEX idx_objects_location ON public.objects(latitude, longitude);
CREATE INDEX idx_objects_created_at ON public.objects(created_at DESC);