
CREATE OR REPLACE FUNCTION public.get_visitor_trends()
RETURNS TABLE(visit_date date, visitor_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    d::date AS visit_date,
    COALESCE(COUNT(DISTINCT sv.visitor_id), 0) AS visitor_count
  FROM generate_series(
    (CURRENT_DATE - INTERVAL '29 days')::date,
    CURRENT_DATE,
    '1 day'::interval
  ) AS d
  LEFT JOIN public.site_visits sv 
    ON (sv.visited_at::date) = d::date
  GROUP BY d::date
  ORDER BY d::date
$$;
