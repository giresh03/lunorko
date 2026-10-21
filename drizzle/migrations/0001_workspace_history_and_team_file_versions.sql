-- Workspace generation history (per user, synced across devices)
CREATE TABLE public.workspace_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  is_full_stack BOOLEAN NOT NULL DEFAULT false,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_id)
);

CREATE INDEX workspace_history_user_created_idx ON public.workspace_history (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_history TO authenticated;
GRANT ALL ON public.workspace_history TO service_role;

ALTER TABLE public.workspace_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace history" ON public.workspace_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workspace history" ON public.workspace_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workspace history" ON public.workspace_history
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own workspace history" ON public.workspace_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Team file version history (one row per save)
CREATE TABLE public.team_file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.team_files(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.team_projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  saved_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX team_file_versions_file_created_idx ON public.team_file_versions (file_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.team_file_versions TO authenticated;
GRANT ALL ON public.team_file_versions TO service_role;

ALTER TABLE public.team_file_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view file versions" ON public.team_file_versions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE project_id = team_file_versions.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Team members can add file versions" ON public.team_file_versions
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = saved_by AND
    EXISTS (SELECT 1 FROM public.team_members WHERE project_id = team_file_versions.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Team members can delete file versions" ON public.team_file_versions
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE project_id = team_file_versions.project_id AND user_id = auth.uid())
  );