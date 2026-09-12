CREATE OR REPLACE FUNCTION public.match_ui_components(_query text, _limit integer DEFAULT 3)
RETURNS TABLE(id text, name text, category text, keywords text, dependencies text[], code text, score real)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  WITH words AS (
    SELECT array_agg(w) AS ws
    FROM (
      SELECT DISTINCT lexeme AS w
      FROM unnest(to_tsvector('english', coalesce(nullif(trim(_query), ''), 'landing page hero card'))) AS t(lexeme)
      LIMIT 40
    ) s
  ),
  q AS (
    SELECT to_tsquery('english', array_to_string(ws, ' | ')) AS tsq FROM words
  ),
  matched AS (
    SELECT c.id, c.name, c.category, c.keywords, c.dependencies, c.code,
           ts_rank(to_tsvector('english', c.search_text), q.tsq) AS score
    FROM public.ui_components c, q
    WHERE to_tsvector('english', c.search_text) @@ q.tsq
    ORDER BY score DESC, c.name
    LIMIT GREATEST(1, _limit)
  ),
  fallback AS (
    SELECT c.id, c.name, c.category, c.keywords, c.dependencies, c.code, 0::real AS score
    FROM public.ui_components c
    WHERE c.category IN ('background', 'card', 'text')
    ORDER BY c.category, c.name
    LIMIT GREATEST(1, _limit)
  )
  SELECT * FROM matched
  UNION ALL
  SELECT * FROM fallback WHERE NOT EXISTS (SELECT 1 FROM matched)
  LIMIT GREATEST(1, _limit);
$function$;