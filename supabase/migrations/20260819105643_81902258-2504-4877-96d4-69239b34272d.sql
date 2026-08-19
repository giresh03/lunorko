CREATE TABLE public.media_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('image','poster','edit','video')),
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  asset_path TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_generations TO authenticated;
GRANT ALL ON public.media_generations TO service_role;

ALTER TABLE public.media_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own generations"
  ON public.media_generations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX media_generations_user_created_idx ON public.media_generations (user_id, created_at DESC);

CREATE TRIGGER update_media_generations_updated_at
  BEFORE UPDATE ON public.media_generations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users read own generated media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'generated-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own generated media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'generated-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own generated media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'generated-media' AND auth.uid()::text = (storage.foldername(name))[1]);

INSERT INTO public.feature_locks (key, label, category, locked)
VALUES ('studio', 'AI Studio', 'Tools', false)
ON CONFLICT (key) DO NOTHING;