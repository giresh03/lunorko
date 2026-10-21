CREATE OR REPLACE FUNCTION public.plan_credit_allowance(_plan_id text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $function$
  SELECT CASE _plan_id
    WHEN 'pro' THEN 1500
    WHEN 'premium' THEN 4000
    WHEN 'professional' THEN 10000
    ELSE 10
  END
$function$;

UPDATE public.ai_credits SET plan_credits = LEAST(plan_credits, 10) WHERE plan_id = 'free';