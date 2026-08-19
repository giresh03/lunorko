-- 1. Remove the public/anon full-row read policy on profiles
DROP POLICY IF EXISTS "Public display fields readable" ON public.profiles;

-- Keep profiles locked to owner + admin reads via existing policies; ensure writes work for owners
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 2. public_profiles view exposes only non-sensitive display fields
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT user_id, display_name, avatar_url, username
FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM PUBLIC;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 3. Restrict SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.get_my_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles() TO authenticated;