
CREATE OR REPLACE FUNCTION public.count_unique_visitors()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT visitor_id) FROM public.site_visits
$$;
