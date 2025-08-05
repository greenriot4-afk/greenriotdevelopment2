-- Add admin policies for objects table
CREATE POLICY "Admins can delete any objects"
ON public.objects
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any objects"
ON public.objects
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert objects"
ON public.objects
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for circular_markets table
CREATE POLICY "Admins can delete any markets"
ON public.circular_markets
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any markets"
ON public.circular_markets
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert markets"
ON public.circular_markets
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));