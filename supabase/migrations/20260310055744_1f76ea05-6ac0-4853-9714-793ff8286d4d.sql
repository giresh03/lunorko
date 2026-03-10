
-- Team Projects table
CREATE TABLE public.team_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  domain_id TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  max_members INTEGER DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'recruiting',
  difficulty TEXT DEFAULT 'intermediate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view projects" ON public.team_projects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create projects" ON public.team_projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update projects" ON public.team_projects
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete projects" ON public.team_projects
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Team Members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.team_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view team members" ON public.team_members
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project owners can add members" ON public.team_members
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.team_projects WHERE id = project_id AND owner_id = auth.uid())
  );
CREATE POLICY "Owners can remove members" ON public.team_members
  FOR DELETE TO authenticated USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.team_projects WHERE id = project_id AND owner_id = auth.uid())
  );

-- Team Join Requests
CREATE TABLE public.team_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.team_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.team_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.team_join_requests
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.team_projects WHERE id = project_id AND owner_id = auth.uid())
  );
CREATE POLICY "Users can create requests" ON public.team_join_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update requests" ON public.team_join_requests
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.team_projects WHERE id = project_id AND owner_id = auth.uid())
  );
CREATE POLICY "Users can delete own requests" ON public.team_join_requests
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Team Files (collaborative code)
CREATE TABLE public.team_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.team_projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL DEFAULT '/',
  content TEXT DEFAULT '',
  language TEXT DEFAULT 'javascript',
  last_edited_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, file_path, file_name)
);

ALTER TABLE public.team_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view files" ON public.team_files
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE project_id = team_files.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Team members can create files" ON public.team_files
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.team_members WHERE project_id = team_files.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Team members can update files" ON public.team_files
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE project_id = team_files.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Team members can delete files" ON public.team_files
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE project_id = team_files.project_id AND user_id = auth.uid())
  );

-- Team Messages (team chat)
CREATE TABLE public.team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.team_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  code_snippet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view messages" ON public.team_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE project_id = team_messages.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Team members can send messages" ON public.team_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.team_members WHERE project_id = team_messages.project_id AND user_id = auth.uid())
  );

-- Enable realtime for team messages and files
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_files;

-- Trigger for updated_at on team_projects
CREATE TRIGGER update_team_projects_updated_at
  BEFORE UPDATE ON public.team_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on team_files
CREATE TRIGGER update_team_files_updated_at
  BEFORE UPDATE ON public.team_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
