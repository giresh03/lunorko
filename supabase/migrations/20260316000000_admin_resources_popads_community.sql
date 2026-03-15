-- Admin-managed resources (videos, articles, materials) per domain
CREATE TABLE IF NOT EXISTS public.admin_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id text NOT NULL,
  title text NOT NULL,
  resource_type text NOT NULL DEFAULT 'video' CHECK (resource_type IN ('video', 'article', 'course', 'material')),
  source text NOT NULL DEFAULT 'Custom',
  url text NOT NULL,
  duration text,
  thumbnail text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pop ads / festival banners (scheduled for festivals)
CREATE TABLE IF NOT EXISTS public.pop_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  link_url text,
  festival_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Community guidelines (editable by admin)
CREATE TABLE IF NOT EXISTS public.community_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id text,
  guideline_text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add is_removed to community_posts for moderation (soft delete)
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS is_removed boolean NOT NULL DEFAULT false;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS removed_at timestamptz;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS removed_by uuid REFERENCES auth.users(id);
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS removal_reason text;

-- RLS: admin_resources, pop_ads - public read for active items
ALTER TABLE public.admin_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active resources" ON public.admin_resources FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active pop ads" ON public.pop_ads FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view guidelines" ON public.community_guidelines FOR SELECT USING (true);

-- Allow service role full access (service role bypasses RLS by default)
-- For anon/authenticated: only SELECT on active items
-- For authenticated admin UI we'll use the admin-dashboard edge function with service role

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_resources_domain ON public.admin_resources(domain_id);
CREATE INDEX IF NOT EXISTS idx_admin_resources_type ON public.admin_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_pop_ads_dates ON public.pop_ads(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_community_posts_removed ON public.community_posts(is_removed);
