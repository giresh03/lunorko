CREATE TABLE public.level_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain_id TEXT NOT NULL,
  level_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, domain_id, level_index)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.level_progress TO authenticated;
GRANT ALL ON public.level_progress TO service_role;

ALTER TABLE public.level_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own level progress"
ON public.level_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own level progress"
ON public.level_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own level progress"
ON public.level_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own level progress"
ON public.level_progress FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_level_progress_updated_at
BEFORE UPDATE ON public.level_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_level_progress_user_domain ON public.level_progress (user_id, domain_id);