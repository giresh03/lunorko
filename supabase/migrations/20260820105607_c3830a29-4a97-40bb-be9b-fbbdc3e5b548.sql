CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  amount integer NOT NULL,
  description text NOT NULL DEFAULT '',
  balance_after integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_kind_check
  CHECK (kind IN ('usage','topup','grant','adjustment'));

CREATE INDEX credit_transactions_user_created_idx
  ON public.credit_transactions(user_id, created_at DESC);

GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own credit transactions"
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all credit transactions"
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.credit_transactions (user_id, kind, amount, description, created_at)
SELECT user_id, 'usage', -amount, COALESCE(feature, 'assistant'), created_at
FROM public.ai_credit_usage;

CREATE OR REPLACE FUNCTION public.consume_ai_credit(_user_id uuid, _amount integer DEFAULT 1, _feature text DEFAULT 'assistant'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.credit_transactions (user_id, kind, amount, description, balance_after)
  VALUES (_user_id, 'usage', -_amount, COALESCE(_feature, 'assistant'), _row.plan_credits + _row.topup_credits);

  RETURN jsonb_build_object(
    'allowed', true,
    'balance', _row.plan_credits + _row.topup_credits,
    'plan_credits', _row.plan_credits,
    'topup_credits', _row.topup_credits,
    'allowance', public.plan_credit_allowance(_row.plan_id),
    'plan_id', _row.plan_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_topup_credits(_user_id uuid, _credits integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _row public.ai_credits;
BEGIN
  PERFORM public.sync_ai_credits(_user_id);
  UPDATE public.ai_credits
    SET topup_credits = topup_credits + GREATEST(_credits, 0)
    WHERE user_id = _user_id
    RETURNING * INTO _row;

  INSERT INTO public.credit_transactions (user_id, kind, amount, description, balance_after)
  VALUES (_user_id, 'topup', GREATEST(_credits, 0), 'Top-up purchase', _row.plan_credits + _row.topup_credits);

  RETURN jsonb_build_object('balance', _row.plan_credits + _row.topup_credits, 'topup_credits', _row.topup_credits);
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_ai_credits(_user_id uuid)
 RETURNS ai_credits
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _plan text;
  _row public.ai_credits;
  _period date := date_trunc('month', now())::date;
  _inserted boolean := false;
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

    INSERT INTO public.credit_transactions (user_id, kind, amount, description, balance_after)
    VALUES (_user_id, 'grant', public.plan_credit_allowance(_plan),
            'Monthly ' || _plan || ' allowance', _row.plan_credits + _row.topup_credits);
  END IF;

  RETURN _row;
END;
$function$;

REVOKE ALL ON FUNCTION public.consume_ai_credit(uuid, integer, text) FROM anon;
REVOKE ALL ON FUNCTION public.add_topup_credits(uuid, integer) FROM anon;
REVOKE ALL ON FUNCTION public.sync_ai_credits(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_credit(uuid, integer, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_topup_credits(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_ai_credits(uuid) TO authenticated, service_role;