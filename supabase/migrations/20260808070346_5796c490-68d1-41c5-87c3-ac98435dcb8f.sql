CREATE OR REPLACE FUNCTION public.admin_list_profiles()
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY created_at DESC
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_profiles() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles() TO authenticated;