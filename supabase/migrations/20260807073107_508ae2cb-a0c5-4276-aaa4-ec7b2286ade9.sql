-- AI credits ledger
CREATE TABLE IF NOT EXISTS public.ai_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan_id text NOT NULL DEFAULT 'free',
  plan_credits integer NOT NULL DEFAULT 0,
  topup_credits integer NOT NULL DEFAULT 0,
  period_start date NOT NULL DEFAULT CURRENT_DATE,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_credits TO authenticated;
GRANT ALL ON public.ai_credits TO service_role;
ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credits" ON public.ai_credits;
CREATE POLICY "Users can view their own credits"
ON public.ai_credits FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_ai_credits_updated_at ON public.ai_credits;
CREATE TRIGGER update_ai_credits_updated_at BEFORE UPDATE ON public.ai_credits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Monthly allowance per plan
CREATE OR REPLACE FUNCTION public.plan_credit_allowance(_plan_id text)
RETURNS integer
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _plan_id
    WHEN 'pro' THEN 60
    WHEN 'premium' THEN 100
    WHEN 'professional' THEN 150
    ELSE 4
  END
$$;

-- Ensure a row exists, refresh monthly allowance / plan changes
CREATE OR REPLACE FUNCTION public.sync_ai_credits(_user_id uuid)
RETURNS public.ai_credits
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plan text;
  _row public.ai_credits;
  _period date := date_trunc('month', now())::date;
BEGIN
  _plan := public.get_user_plan(_user_id);

  INSERT INTO public.ai_credits (user_id, plan_id, plan_credits, period_start)
  VALUES (_user_id, _plan, public.plan_credit_allowance(_plan), _period)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO _row FROM public.ai_credits WHERE user_id = _user_id FOR UPDATE;

  IF _row.period_start < _period OR _row.plan_id <> _plan THEN
    UPDATE public.ai_credits
      SET plan_credits = public.plan_credit_allowance(_plan),
          plan_id = _plan,
          period_start = _period
      WHERE user_id = _user_id
      RETURNING * INTO _row;
  END IF;

  RETURN _row;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_ai_credits(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_ai_credits(uuid) TO service_role;

-- Deduct one credit (plan credits first, then top-ups)
CREATE OR REPLACE FUNCTION public.consume_ai_credit(_user_id uuid, _amount integer DEFAULT 1)
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

  RETURN jsonb_build_object(
    'allowed', true,
    'balance', _row.plan_credits + _row.topup_credits,
    'plan_credits', _row.plan_credits,
    'topup_credits', _row.topup_credits,
    'plan_id', _row.plan_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_credit(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_credit(uuid, integer) TO service_role;

-- Add purchased top-up credits
CREATE OR REPLACE FUNCTION public.add_topup_credits(_user_id uuid, _credits integer)
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.ai_credits;
BEGIN
  PERFORM public.sync_ai_credits(_user_id);
  UPDATE public.ai_credits
    SET topup_credits = topup_credits + GREATEST(_credits, 0)
    WHERE user_id = _user_id
    RETURNING * INTO _row;
  RETURN jsonb_build_object('balance', _row.plan_credits + _row.topup_credits, 'topup_credits', _row.topup_credits);
END;
$$;

REVOKE ALL ON FUNCTION public.add_topup_credits(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_topup_credits(uuid, integer) TO service_role;

-- New subscription prices
UPDATE public.subscription_plans SET price = 150 WHERE id = 'pro';
UPDATE public.subscription_plans SET price = 250 WHERE id = 'premium';
UPDATE public.subscription_plans SET price = 500 WHERE id = 'professional';