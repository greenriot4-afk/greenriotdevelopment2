-- Create proper foreign key between objects and profiles
-- First check if profiles exist for all object users
DO $$ 
BEGIN
  -- Insert missing profiles for users who have objects but no profile
  INSERT INTO public.profiles (user_id, display_name)
  SELECT DISTINCT o.user_id, 'Usuario'
  FROM public.objects o 
  LEFT JOIN public.profiles p ON o.user_id = p.user_id 
  WHERE p.user_id IS NULL;
  
  -- Now add the foreign key constraint
  ALTER TABLE public.objects 
  ADD CONSTRAINT fk_objects_user_profile 
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) 
  ON DELETE CASCADE;
  
EXCEPTION 
  WHEN OTHERS THEN 
    RAISE NOTICE 'Foreign key constraint may already exist or there are data issues';
END $$;

-- Create materialized view for ultra-fast object loading
CREATE MATERIALIZED VIEW IF NOT EXISTS public.objects_with_profiles AS
SELECT 
  o.id,
  o.type,
  o.title,
  o.description,
  o.image_url,
  o.latitude,
  o.longitude,
  o.price_credits,
  o.is_sold,
  o.user_id,
  o.created_at,
  o.updated_at,
  o.market_id,
  p.display_name as user_display_name,
  p.username
FROM public.objects o
LEFT JOIN public.profiles p ON o.user_id = p.user_id
WHERE o.is_sold = false;

-- Create unique index for ultra-fast queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_objects_with_profiles_id ON public.objects_with_profiles(id);
CREATE INDEX IF NOT EXISTS idx_objects_with_profiles_type ON public.objects_with_profiles(type);
CREATE INDEX IF NOT EXISTS idx_objects_with_profiles_created_at ON public.objects_with_profiles(created_at DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_objects_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.objects_with_profiles;
END;
$$;

-- Trigger to auto-refresh the view when objects change
CREATE OR REPLACE FUNCTION trigger_refresh_objects_view()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use pg_notify to trigger async refresh
  PERFORM pg_notify('refresh_objects_view', '');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS refresh_objects_on_insert ON public.objects;
DROP TRIGGER IF EXISTS refresh_objects_on_update ON public.objects;
DROP TRIGGER IF EXISTS refresh_objects_on_delete ON public.objects;

-- Create triggers
CREATE TRIGGER refresh_objects_on_insert
  AFTER INSERT ON public.objects
  FOR EACH ROW EXECUTE FUNCTION trigger_refresh_objects_view();

CREATE TRIGGER refresh_objects_on_update
  AFTER UPDATE ON public.objects
  FOR EACH ROW EXECUTE FUNCTION trigger_refresh_objects_view();

CREATE TRIGGER refresh_objects_on_delete
  AFTER DELETE ON public.objects
  FOR EACH ROW EXECUTE FUNCTION trigger_refresh_objects_view();