-- Hackathons catalog + winner projects marketplace

CREATE TABLE IF NOT EXISTS public.hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organizer text NOT NULL,
  location text NOT NULL DEFAULT 'Global',
  mode text NOT NULL DEFAULT 'online',
  start_date date NOT NULL,
  end_date date NOT NULL,
  registration_deadline date,
  prize_pool text,
  website_url text NOT NULL,
  banner_url text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hackathons_mode_check CHECK (mode IN ('online', 'offline', 'hybrid'))
);

CREATE TABLE IF NOT EXISTS public.hackathon_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid REFERENCES public.hackathons(id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text,
  winner_name text,
  tech_stack text[] NOT NULL DEFAULT '{}',
  team_size integer NOT NULL DEFAULT 1,
  max_buyers integer NOT NULL DEFAULT 0,
  buyers_count integer NOT NULL DEFAULT 0,
  price integer NOT NULL CHECK (price >= 0),
  preview_url text,
  repository_url text,
  thumbnail_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hackathon_project_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.hackathon_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'paid',
  razorpay_order_id text NOT NULL,
  razorpay_payment_id text NOT NULL,
  razorpay_signature text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id),
  UNIQUE (razorpay_payment_id)
);

CREATE INDEX IF NOT EXISTS idx_hackathons_dates ON public.hackathons(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_hackathons_active ON public.hackathons(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_hackathon_projects_active ON public.hackathon_projects(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_hackathon_project_purchases_project ON public.hackathon_project_purchases(project_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_project_purchases_user ON public.hackathon_project_purchases(user_id);

CREATE TRIGGER update_hackathons_updated_at
BEFORE UPDATE ON public.hackathons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hackathon_projects_updated_at
BEFORE UPDATE ON public.hackathon_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.sync_hackathon_project_buyers_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.hackathon_projects
    SET buyers_count = buyers_count + 1
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.hackathon_projects
    SET buyers_count = GREATEST(buyers_count - 1, 0)
    WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER sync_buyers_count_after_insert
AFTER INSERT ON public.hackathon_project_purchases
FOR EACH ROW EXECUTE FUNCTION public.sync_hackathon_project_buyers_count();

CREATE TRIGGER sync_buyers_count_after_delete
AFTER DELETE ON public.hackathon_project_purchases
FOR EACH ROW EXECUTE FUNCTION public.sync_hackathon_project_buyers_count();

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_project_purchases ENABLE ROW LEVEL SECURITY;

-- Public can browse active hackathons and projects
CREATE POLICY "Public can view active hackathons"
ON public.hackathons
FOR SELECT
USING (is_active = true);

CREATE POLICY "Public can view active hackathon projects"
ON public.hackathon_projects
FOR SELECT
USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins manage hackathons"
ON public.hackathons
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage hackathon projects"
ON public.hackathon_projects
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins view project purchases"
ON public.hackathon_project_purchases
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own project purchases"
ON public.hackathon_project_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Seed demo hackathons
INSERT INTO public.hackathons (
  title, organizer, location, mode, start_date, end_date, registration_deadline, prize_pool, website_url, banner_url, description, sort_order, is_active
) VALUES
  (
    'NASA Space Apps Challenge',
    'NASA + Global Partners',
    'Global',
    'hybrid',
    '2026-10-03',
    '2026-10-04',
    '2026-09-20',
    'Global Awards',
    'https://www.spaceappschallenge.org/',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa',
    'The world''s largest annual global hackathon focused on space, Earth, sustainability, and open innovation.',
    1,
    true
  ),
  (
    'ETHGlobal Hackathon Series',
    'ETHGlobal',
    'Global',
    'hybrid',
    '2026-06-14',
    '2026-06-16',
    '2026-05-30',
    '$500K+ bounties',
    'https://ethglobal.com/',
    'https://images.unsplash.com/photo-1639322537228-f710d846310a',
    'Build Web3 products with top protocols and mentors across DeFi, infra, AI, and developer tooling.',
    2,
    true
  ),
  (
    'MLH Global Hack Week',
    'Major League Hacking',
    'Global',
    'online',
    '2026-07-20',
    '2026-07-27',
    '2026-07-10',
    'Swag + partner prizes',
    'https://mlh.io/',
    'https://images.unsplash.com/photo-1518770660439-4636190af475',
    'A week-long beginner-friendly hackathon and workshop format covering AI, web, cloud, and career tracks.',
    3,
    true
  ),
  (
    'HackMIT',
    'MIT',
    'Cambridge, MA, USA',
    'offline',
    '2026-09-19',
    '2026-09-20',
    '2026-08-25',
    '$100K+ in prizes',
    'https://hackmit.org/',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    'One of the most competitive student hackathons focused on ambitious product prototypes and deep tech ideas.',
    4,
    true
  );

-- Seed demo purchasable winner projects (10 minimum)
WITH h AS (
  SELECT id, title FROM public.hackathons
)
INSERT INTO public.hackathon_projects (
  hackathon_id, title, summary, winner_name, tech_stack, team_size, max_buyers, price, preview_url, repository_url, thumbnail_url, sort_order, is_active
)
VALUES
  ((SELECT id FROM h WHERE title = 'NASA Space Apps Challenge'), 'Orbital Crop Monitor', 'Satellite + weather intelligence dashboard for precision farming.', 'Team AgroOrbit', ARRAY['React', 'Node.js', 'PostgreSQL', 'Mapbox'], 4, 200, 249900, 'https://www.spaceappschallenge.org/', 'https://github.com/', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399', 1, true),
  ((SELECT id FROM h WHERE title = 'NASA Space Apps Challenge'), 'Disaster Lens AI', 'Flood and wildfire early warning alerts using open geospatial feeds.', 'Team TerraShield', ARRAY['Python', 'FastAPI', 'TensorFlow', 'Leaflet'], 5, 150, 199900, 'https://www.spaceappschallenge.org/', 'https://github.com/', 'https://images.unsplash.com/photo-1581094271901-8022df4466f9', 2, true),
  ((SELECT id FROM h WHERE title = 'ETHGlobal Hackathon Series'), 'ZeroGas Wallet Guard', 'Smart transaction simulator and risk checker for wallet safety.', 'Team SafeSign', ARRAY['Next.js', 'Solidity', 'ethers.js', 'The Graph'], 3, 300, 149900, 'https://ethglobal.com/', 'https://github.com/', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0', 3, true),
  ((SELECT id FROM h WHERE title = 'ETHGlobal Hackathon Series'), 'DAO Treasury CoPilot', 'Governance analytics and treasury allocation recommendation engine.', 'Team GovPilot', ARRAY['TypeScript', 'Node.js', 'Supabase', 'D3'], 4, 120, 229900, 'https://ethglobal.com/', 'https://github.com/', 'https://images.unsplash.com/photo-1559526324-593bc073d938', 4, true),
  ((SELECT id FROM h WHERE title = 'MLH Global Hack Week'), 'Campus Mentor Match', 'AI-powered mentoring graph matching juniors with alumni mentors.', 'Team MentorMesh', ARRAY['React', 'Supabase', 'OpenAI API'], 4, 500, 99900, 'https://mlh.io/', 'https://github.com/', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f', 5, true),
  ((SELECT id FROM h WHERE title = 'MLH Global Hack Week'), 'Code Interview Arena', 'Realtime coding room with problem packs and evaluator analytics.', 'Team PairPulse', ARRAY['Next.js', 'Socket.IO', 'Monaco', 'Redis'], 5, 250, 179900, 'https://mlh.io/', 'https://github.com/', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4', 6, true),
  ((SELECT id FROM h WHERE title = 'HackMIT'), 'HealthBridge Remote Triage', 'Low-bandwidth tele-triage web app for rural healthcare teams.', 'Team HealthBridge', ARRAY['React', 'Express', 'Twilio', 'PostgreSQL'], 4, 180, 189900, 'https://hackmit.org/', 'https://github.com/', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d', 7, true),
  ((SELECT id FROM h WHERE title = 'HackMIT'), 'EdgeSign Language Tutor', 'Sign language learning app with webcam gesture feedback.', 'Team GestureGrid', ARRAY['Vue', 'MediaPipe', 'Firebase'], 3, 220, 169900, 'https://hackmit.org/', 'https://github.com/', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3', 8, true),
  ((SELECT id FROM h WHERE title = 'HackMIT'), 'CarbonRoute Optimizer', 'Fleet routing platform to reduce emissions and delivery costs.', 'Team RouteNova', ARRAY['React', 'Python', 'OR-Tools', 'PostGIS'], 5, 140, 259900, 'https://hackmit.org/', 'https://github.com/', 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8', 9, true),
  ((SELECT id FROM h WHERE title = 'ETHGlobal Hackathon Series'), 'ProofPort Resume Chain', 'Verifiable skill credentials and portfolio proof protocol.', 'Team CredChain', ARRAY['Next.js', 'Solidity', 'IPFS'], 3, 320, 139900, 'https://ethglobal.com/', 'https://github.com/', 'https://images.unsplash.com/photo-1551434678-e076c223a692', 10, true);
