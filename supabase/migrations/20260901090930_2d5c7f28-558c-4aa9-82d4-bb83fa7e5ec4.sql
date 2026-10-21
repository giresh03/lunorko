CREATE OR REPLACE FUNCTION public.match_exemplars(_query text, _limit integer DEFAULT 5)
RETURNS TABLE (id text, layer text, kind text, domain text, stack text[], instruction text, response text, score real)
LANGUAGE sql
STABLE
SECURITY INVOKER
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