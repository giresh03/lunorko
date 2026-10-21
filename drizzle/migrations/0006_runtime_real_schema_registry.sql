-- Registry of the real tables that back each generated app, plus its read-only DB login.

CREATE TABLE IF NOT EXISTS public.runtime_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.runtime_projects(id) ON DELETE CASCADE,
  collection text NOT NULL,
  schema_name text NOT NULL,
  table_name text NOT NULL,
  columns jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, collection)
);

GRANT SELECT ON public.runtime_tables TO authenticated;
GRANT ALL ON public.runtime_tables TO service_role;

ALTER TABLE public.runtime_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and team members can view their app tables"
ON public.runtime_tables
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.runtime_projects p
    WHERE p.id = runtime_tables.project_id
      AND (
        p.owner_id = auth.uid()
        OR (p.scope = 'team' AND EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.project_id::text = p.scope_key AND tm.user_id = auth.uid()
        ))
      )
  )
);

CREATE TABLE IF NOT EXISTS public.runtime_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.runtime_projects(id) ON DELETE CASCADE,
  schema_name text NOT NULL,
  db_role text NOT NULL,
  password_cipher text NOT NULL,
  scope text NOT NULL DEFAULT 'read-only',
  created_at timestamptz NOT NULL DEFAULT now(),
  rotated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id)
);

GRANT ALL ON public.runtime_credentials TO service_role;

ALTER TABLE public.runtime_credentials ENABLE ROW LEVEL SECURITY;
-- No client policies: credentials are only ever read by the runtime edge function,
-- which decrypts them for the project owner.

ALTER TABLE public.runtime_projects
  ADD COLUMN IF NOT EXISTS schema_name text,
  ADD COLUMN IF NOT EXISTS migrated_at timestamptz;

CREATE INDEX IF NOT EXISTS runtime_tables_project_idx ON public.runtime_tables(project_id);
