-- Insert admin role for current user (this will need to be run by an admin or manually)
-- You'll need to replace the UUID with your actual user ID
-- For now, we'll create a function to make any authenticated user an admin temporarily

CREATE OR REPLACE FUNCTION public.make_user_admin(_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.make_user_admin(uuid) TO authenticated;