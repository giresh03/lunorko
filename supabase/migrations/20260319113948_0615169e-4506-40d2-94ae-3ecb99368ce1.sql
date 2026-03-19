
-- Create pop_ads table
CREATE TABLE public.pop_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  festival_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pop_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pop ads are publicly readable"
ON public.pop_ads FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage pop ads"
ON public.pop_ads FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create admin_resources table
CREATE TABLE public.admin_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'video',
  source TEXT,
  url TEXT,
  duration TEXT,
  thumbnail TEXT,
  description TEXT,
  domain_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin resources are publicly readable"
ON public.admin_resources FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage admin resources"
ON public.admin_resources FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
