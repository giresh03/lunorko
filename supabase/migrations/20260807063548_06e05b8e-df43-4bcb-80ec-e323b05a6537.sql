CREATE TABLE public.github_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  github_login text,
  auth_type text NOT NULL CHECK (auth_type IN ('oauth','pat')),
  access_token text NOT NULL,
  last_repo text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

REVOKE ALL ON public.github_connections FROM anon, authenticated;
GRANT SELECT (id, user_id, github_login, auth_type, last_repo, created_at, updated_at) ON public.github_connections TO authenticated;
GRANT DELETE ON public.github_connections TO authenticated;
GRANT ALL ON public.github_connections TO service_role;

ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own GitHub connection"
ON public.github_connections FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own GitHub connection"
ON public.github_connections FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_github_connections_updated_at
BEFORE UPDATE ON public.github_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();