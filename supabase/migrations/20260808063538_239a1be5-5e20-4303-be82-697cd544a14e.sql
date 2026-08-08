-- 1) Much more affordable allowances
CREATE OR REPLACE FUNCTION public.plan_credit_allowance(_plan_id text)
RETURNS integer
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _plan_id
    WHEN 'pro' THEN 1500
    WHEN 'premium' THEN 4000
    WHEN 'professional' THEN 10000
    ELSE 100
  END
$$;

-- 2) Usage ledger for the tracker
CREATE TABLE IF NOT EXISTS public.ai_credit_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL DEFAULT 'assistant',
  amount integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_credit_usage TO authenticated;
GRANT ALL ON public.ai_credit_usage TO service_role;

ALTER TABLE public.ai_credit_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credit usage" ON public.ai_credit_usage;
CREATE POLICY "Users can view their own credit usage"
ON public.ai_credit_usage FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ai_credit_usage_user_created_idx
  ON public.ai_credit_usage (user_id, created_at DESC);

-- 3) Log every deduction
CREATE OR REPLACE FUNCTION public.consume_ai_credit(_user_id uuid, _amount integer DEFAULT 1, _feature text DEFAULT 'assistant')
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.ai_credits;
  _from_plan integer;
  _from_topup integer;
BEGIN
  _row := public.sync_ai_credits(_user_id);

  IF (_row.plan_credits + _row.topup_credits) < _amount THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'balance', _row.plan_credits + _row.topup_credits,
      'plan_credits', _row.plan_credits,
      'topup_credits', _row.topup_credits,
      'allowance', public.plan_credit_allowance(_row.plan_id),
      'plan_id', _row.plan_id
    );
  END IF;

  _from_plan := LEAST(_row.plan_credits, _amount);
  _from_topup := _amount - _from_plan;

  UPDATE public.ai_credits
    SET plan_credits = plan_credits - _from_plan,
        topup_credits = topup_credits - _from_topup
    WHERE user_id = _user_id
    RETURNING * INTO _row;

  INSERT INTO public.ai_credit_usage (user_id, feature, amount)
  VALUES (_user_id, COALESCE(_feature, 'assistant'), _amount);

  RETURN jsonb_build_object(
    'allowed', true,
    'balance', _row.plan_credits + _row.topup_credits,
    'plan_credits', _row.plan_credits,
    'topup_credits', _row.topup_credits,
    'allowance', public.plan_credit_allowance(_row.plan_id),
    'plan_id', _row.plan_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_credit(uuid, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_credit(uuid, integer, text) TO service_role;

-- 4) New signups get a credit row automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.ai_credits (user_id, plan_id, plan_credits, period_start)
  VALUES (NEW.id, 'free', public.plan_credit_allowance('free'), date_trunc('month', now())::date)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;