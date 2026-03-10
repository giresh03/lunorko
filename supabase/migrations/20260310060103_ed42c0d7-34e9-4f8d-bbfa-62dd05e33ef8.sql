
-- Allow authenticated users to view all profiles (needed for community/team features)
CREATE POLICY "Auth users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
