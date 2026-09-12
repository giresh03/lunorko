-- Lunor Live Runtime: hosted backend for AI-generated full-stack projects

CREATE TABLE public.runtime_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  scope text NOT NULL CHECK (scope IN ('domain', 'level', 'team')),
  scope_key text NOT NULL,
  name text NOT NULL DEFAULT 'app',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, scope, scope_key)
);
CREATE UNIQUE INDEX runtime_projects_team_scope_key_idx
  ON public.runtime_projects (scope, scope_key) WHERE scope = 'team';

GRANT SELECT, DELETE ON public.runtime_projects TO authenticated;
GRANT ALL ON public.runtime_projects TO service_role;

ALTER TABLE public.runtime_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their runtime projects"
  ON public.runtime_projects FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their runtime projects"
  ON public.runtime_projects FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

CREATE TRIGGER update_runtime_projects_updated_at
  BEFORE UPDATE ON public.runtime_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.runtime_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.runtime_projects(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, email)
);

GRANT SELECT ON public.runtime_users TO authenticated;
GRANT ALL ON public.runtime_users TO service_role;

ALTER TABLE public.runtime_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view runtime users"
  ON public.runtime_users FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.runtime_projects p
    WHERE p.id = runtime_users.project_id AND p.owner_id = auth.uid()
  ));

CREATE TABLE public.runtime_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.runtime_projects(id) ON DELETE CASCADE,
  collection text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  owner_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX runtime_documents_project_collection_idx
  ON public.runtime_documents (project_id, collection, created_at DESC);

GRANT SELECT ON public.runtime_documents TO authenticated;
GRANT ALL ON public.runtime_documents TO service_role;

ALTER TABLE public.runtime_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view runtime documents"
  ON public.runtime_documents FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.runtime_projects p
    WHERE p.id = runtime_documents.project_id AND p.owner_id = auth.uid()
  ));

CREATE TRIGGER update_runtime_documents_updated_at
  BEFORE UPDATE ON public.runtime_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();