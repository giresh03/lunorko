CREATE TABLE public.internship_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  assignment_title text,
  github_repo_url text NOT NULL,
  deployment_url text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'submitted',
  admin_notes text,
  score integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.internship_submissions TO authenticated;
GRANT ALL ON public.internship_submissions TO service_role;

ALTER TABLE public.internship_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit their own assignment"
  ON public.internship_submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions"
  ON public.internship_submissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
  ON public.internship_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions"
  ON public.internship_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_internship_submissions_created_at ON public.internship_submissions (created_at DESC);
CREATE INDEX idx_internship_submissions_user ON public.internship_submissions (user_id);

CREATE TRIGGER update_internship_submissions_updated_at
  BEFORE UPDATE ON public.internship_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();