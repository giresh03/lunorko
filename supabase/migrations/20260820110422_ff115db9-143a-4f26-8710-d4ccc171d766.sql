DROP POLICY IF EXISTS "Auth users can view team members" ON public.team_members;

CREATE POLICY "Members and owners can view team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.team_projects p
    WHERE p.id = team_members.project_id AND p.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.team_members m
    WHERE m.project_id = team_members.project_id AND m.user_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.team_member_counts()
RETURNS TABLE(project_id uuid, member_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tm.project_id, COUNT(*)::bigint
  FROM public.team_members tm
  GROUP BY tm.project_id
$$;

REVOKE ALL ON FUNCTION public.team_member_counts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.team_member_counts() FROM anon;
GRANT EXECUTE ON FUNCTION public.team_member_counts() TO authenticated;