CREATE TABLE public.internship_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL,
  college text,
  year_of_study text,
  portfolio_url text,
  github_url text,
  linkedin_url text,
  skills text,
  why_join text,
  resume_url text,
  resume_filename text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.internship_applications TO authenticated;
GRANT UPDATE ON public.internship_applications TO authenticated;
GRANT ALL ON public.internship_applications TO service_role;

ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit their own application"
  ON public.internship_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications"
  ON public.internship_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON public.internship_applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
  ON public.internship_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_internship_applications_created_at ON public.internship_applications (created_at DESC);
CREATE INDEX idx_internship_applications_user ON public.internship_applications (user_id);

CREATE TRIGGER update_internship_applications_updated_at
  BEFORE UPDATE ON public.internship_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();