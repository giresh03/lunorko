CREATE POLICY "Admins can delete any message" ON public.community_messages
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));