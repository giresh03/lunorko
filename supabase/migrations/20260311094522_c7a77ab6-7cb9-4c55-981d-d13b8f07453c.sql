CREATE TABLE public.design_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Design',
  canvas_data JSONB NOT NULL DEFAULT '{"elements":[],"viewport":{"x":0,"y":0,"zoom":1}}'::jsonb,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.design_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own designs" ON public.design_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own designs" ON public.design_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own designs" ON public.design_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own designs" ON public.design_projects FOR DELETE USING (auth.uid() = user_id);