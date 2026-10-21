CREATE TABLE public.demo_builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  level text NOT NULL DEFAULT 'advanced',
  prompt text NOT NULL,
  prompt_key text UNIQUE NOT NULL,
  domain text NOT NULL DEFAULT 'web-development',
  response text NOT NULL,
  file_count integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.demo_builds TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.demo_builds TO authenticated;
GRANT ALL ON public.demo_builds TO service_role;

ALTER TABLE public.demo_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Demo builds are readable"
  ON public.demo_builds FOR SELECT
  USING (true);

CREATE POLICY "Admins manage demo builds"
  ON public.demo_builds FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_demo_builds_updated_at
  BEFORE UPDATE ON public.demo_builds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();