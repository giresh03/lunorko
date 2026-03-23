-- Hackathons (global events, admin-managed, public read)
CREATE TABLE IF NOT EXISTS public.hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location_label text,
  is_online boolean NOT NULL DEFAULT false,
  start_date date,
  end_date date,
  registration_url text,
  website_url text,
  banner_image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Winner projects for sale (listing is public; deliverable is separate table)
CREATE TABLE IF NOT EXISTS public.hackathon_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid REFERENCES public.hackathons(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  team_winner_name text,
  price_paise integer NOT NULL CHECK (price_paise > 0),
  preview_image_url text,
  tech_stack text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Shown only to buyers (RLS)
CREATE TABLE IF NOT EXISTS public.hackathon_project_deliverables (
  project_id uuid PRIMARY KEY REFERENCES public.hackathon_projects(id) ON DELETE CASCADE,
  deliverable_url text,
  access_instructions text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hackathon_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.hackathon_projects(id) ON DELETE RESTRICT,
  amount_paise integer NOT NULL,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_hackathon_projects_hackathon ON public.hackathon_projects(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_purchases_user ON public.hackathon_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_purchases_project ON public.hackathon_purchases(project_id);

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hackathons_public_read" ON public.hackathons
  FOR SELECT USING (is_active = true);

CREATE POLICY "hackathon_projects_public_read" ON public.hackathon_projects
  FOR SELECT USING (is_active = true);

CREATE POLICY "deliverables_buyers_only" ON public.hackathon_project_deliverables
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.hackathon_purchases hp
      WHERE hp.project_id = hackathon_project_deliverables.project_id
        AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "purchases_own_read" ON public.hackathon_purchases
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
