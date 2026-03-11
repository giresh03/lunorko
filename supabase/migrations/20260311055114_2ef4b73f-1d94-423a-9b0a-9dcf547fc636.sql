
CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visited_at timestamp with time zone NOT NULL DEFAULT now(),
  page_path text DEFAULT '/',
  user_agent text DEFAULT NULL,
  visitor_id text DEFAULT NULL
);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone (even anonymous) to insert visits
CREATE POLICY "Anyone can insert visits"
  ON public.site_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view visits
CREATE POLICY "Admins can view visits"
  ON public.site_visits FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
