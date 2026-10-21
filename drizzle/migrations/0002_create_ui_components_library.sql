CREATE TABLE public.ui_components (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'effect',
  keywords text NOT NULL DEFAULT '',
  dependencies text[] NOT NULL DEFAULT '{}',
  code text NOT NULL,
  search_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ui_components TO authenticated;
GRANT ALL ON public.ui_components TO service_role;

ALTER TABLE public.ui_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ui components"
ON public.ui_components FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage ui components"
ON public.ui_components FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX ui_components_search_idx ON public.ui_components USING gin (to_tsvector('english', search_text));

CREATE OR REPLACE FUNCTION public.match_ui_components(_query text, _limit integer DEFAULT 3)
RETURNS TABLE(id text, name text, category text, keywords text, dependencies text[], code text, score real)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  WITH q AS (
    SELECT websearch_to_tsquery('english', coalesce(nullif(trim(_query), ''), 'landing page hero')) AS tsq
  )
  SELECT c.id, c.name, c.category, c.keywords, c.dependencies, c.code,
         ts_rank(to_tsvector('english', c.search_text), q.tsq) AS score
  FROM public.ui_components c, q
  WHERE to_tsvector('english', c.search_text) @@ q.tsq
  ORDER BY score DESC, c.name
  LIMIT GREATEST(1, _limit);
$function$;