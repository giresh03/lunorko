CREATE TABLE public.feature_locks (
  key text PRIMARY KEY,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  locked boolean NOT NULL DEFAULT false,
  message text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.feature_locks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_locks TO authenticated;
GRANT ALL ON public.feature_locks TO service_role;

ALTER TABLE public.feature_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feature locks"
  ON public.feature_locks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage feature locks"
  ON public.feature_locks FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_feature_locks_updated_at
  BEFORE UPDATE ON public.feature_locks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.feature_locks (key, label, category) VALUES
  ('videos', 'Video Library', 'learning'),
  ('materials', 'Learning Materials', 'learning'),
  ('domains', 'Domain Pages', 'learning'),
  ('challenges', 'Daily Challenges', 'learning'),
  ('ai_interview', 'AI Video Interview', 'ai'),
  ('code_editor', 'Lunor AI Editor', 'ai'),
  ('assistant', 'AI Assistant', 'ai'),
  ('skill_radar', 'AI Skill Radar', 'ai'),
  ('resume_builder', 'Resume Builder', 'career'),
  ('mentors', 'Mentors', 'career'),
  ('community', 'Community Hub', 'social'),
  ('projects', 'Project Builder', 'social'),
  ('visual_builder', 'Visual UI/UX Builder', 'tools'),
  ('promo', 'Promo Page', 'tools');