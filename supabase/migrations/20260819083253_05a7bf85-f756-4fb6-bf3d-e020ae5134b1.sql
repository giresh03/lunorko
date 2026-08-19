-- Column-level public exposure instead of a definer view
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT user_id, display_name, avatar_url, username
FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM PUBLIC;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- profiles: only the four display columns are selectable by anon/authenticated
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (user_id, display_name, avatar_url, username) ON public.profiles TO anon, authenticated;

DROP POLICY IF EXISTS "Display columns readable" ON public.profiles;
CREATE POLICY "Display columns readable"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);