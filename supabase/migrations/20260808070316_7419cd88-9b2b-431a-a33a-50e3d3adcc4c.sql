-- 1. Restrict profiles row exposure
DROP POLICY IF EXISTS "Auth users can view all profiles" ON public.profiles;

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT user_id, display_name, avatar_url, username
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

CREATE POLICY "Public display fields readable"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

-- restrict the sensitive columns at the grant level
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, user_id, display_name, avatar_url, username, created_at, updated_at) ON public.profiles TO authenticated;
GRANT SELECT (user_id, display_name, avatar_url, username) ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;

-- owner + admin full-row access via dedicated policies stay in place; add explicit owner grant path
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE user_id = auth.uid()
$$;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- 2. Storage ownership checks
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Auth users can upload community images" ON storage.objects;
CREATE POLICY "Auth users can upload community images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Lock down internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.consume_ai_credit(uuid, integer, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_ai_credits(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_topup_credits(uuid, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.count_unique_visitors() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_visitor_trends() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_post_likes_count() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_post_comments_count() FROM anon, authenticated;