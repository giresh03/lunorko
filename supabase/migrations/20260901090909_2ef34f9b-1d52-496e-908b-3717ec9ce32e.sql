CREATE TABLE IF NOT EXISTS public.ai_exemplars (
  id text PRIMARY KEY,
  layer text NOT NULL,
  kind text,
  domain text,
  stack text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  difficulty text,
  instruction text NOT NULL,
  response text NOT NULL,
  search_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_exemplars TO authenticated;
GRANT ALL ON public.ai_exemplars TO service_role;

ALTER TABLE public.ai_exemplars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can read exemplars"
  ON public.ai_exemplars FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage exemplars"
  ON public.ai_exemplars FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS ai_exemplars_layer_idx ON public.ai_exemplars (layer);
CREATE INDEX IF NOT EXISTS ai_exemplars_domain_idx ON public.ai_exemplars (domain);
CREATE INDEX IF NOT EXISTS ai_exemplars_fts_idx ON public.ai_exemplars
  USING gin (to_tsvector('english', search_text));

CREATE OR REPLACE FUNCTION public.match_exemplars(_query text, _limit integer DEFAULT 5)
RETURNS TABLE (id text, layer text, kind text, domain text, stack text[], instruction text, response text, score real)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH q AS (
    SELECT websearch_to_tsquery('english', coalesce(nullif(trim(_query), ''), 'website')) AS tsq
  ),
  ranked AS (
    SELECT e.id, e.layer, e.kind, e.domain, e.stack, e.instruction, e.response,
           ts_rank(to_tsvector('english', e.search_text), q.tsq) AS score,
           row_number() OVER (
             PARTITION BY e.layer
             ORDER BY ts_rank(to_tsvector('english', e.search_text), q.tsq) DESC, e.id
           ) AS rn
    FROM public.ai_exemplars e, q
  )
  SELECT id, layer, kind, domain, stack, instruction, response, score
  FROM ranked
  WHERE rn <= GREATEST(1, _limit / 3)
  ORDER BY score DESC, layer
  LIMIT GREATEST(1, _limit);
$$;

REVOKE ALL ON FUNCTION public.match_exemplars(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_exemplars(text, integer) TO authenticated, service_role;