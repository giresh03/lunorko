ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS coupon_code text;
CREATE OR REPLACE FUNCTION public.activate_subscription(_user_id uuid, _plan_id text, _order_id text DEFAULT NULL, _payment_id text DEFAULT NULL, _domain_id text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE _amount integer := 0; _sub public.subscriptions; _allow integer; _order public.payment_orders;
BEGIN
  IF _order_id IS NOT NULL THEN
    SELECT * INTO _order FROM public.payment_orders WHERE razorpay_order_id = _order_id FOR UPDATE;
    IF _order.id IS NULL OR _order.user_id <> _user_id OR _order.plan_id <> _plan_id OR _order.currency <> 'INR' THEN
      RAISE EXCEPTION 'Invalid payment order';
    END IF;
    IF _order.status = 'paid' THEN
      RETURN jsonb_build_object('ok', true, 'plan_id', _plan_id, 'domain_id', _domain_id, 'already_paid', true);
    END IF;
    _amount := _order.amount_cents / 100;
  ELSE
    SELECT price INTO _amount FROM public.subscription_plans WHERE id = _plan_id;
  END IF;
  UPDATE public.payment_orders SET status = 'paid', paid_at = now(), razorpay_payment_id = COALESCE(_payment_id, razorpay_payment_id) WHERE razorpay_order_id = _order_id;
  SELECT * INTO _sub FROM public.subscriptions WHERE user_id = _user_id AND plan_id = _plan_id AND status = 'active' AND expires_at > now() AND domain_id IS NOT DISTINCT FROM _domain_id ORDER BY expires_at DESC LIMIT 1;
  IF _sub.id IS NOT NULL THEN
    UPDATE public.subscriptions SET expires_at = _sub.expires_at + interval '1 month', amount = COALESCE(_amount, 0), razorpay_payment_id = COALESCE(_payment_id, razorpay_payment_id), razorpay_order_id = COALESCE(_order_id, razorpay_order_id) WHERE id = _sub.id RETURNING * INTO _sub;
  ELSE
    INSERT INTO public.subscriptions (user_id, plan_id, domain_id, status, amount, started_at, expires_at, razorpay_order_id, razorpay_payment_id) VALUES (_user_id, _plan_id, _domain_id, 'active', COALESCE(_amount, 0), now(), now() + interval '1 month', _order_id, _payment_id) RETURNING * INTO _sub;
  END IF;
  _allow := public.plan_credit_allowance(_plan_id);
  INSERT INTO public.ai_credits (user_id, plan_id, plan_credits, period_start) VALUES (_user_id, _plan_id, _allow, date_trunc('month', now())::date) ON CONFLICT (user_id) DO UPDATE SET plan_id = _plan_id, plan_credits = GREATEST(public.ai_credits.plan_credits, _allow), period_start = date_trunc('month', now())::date;
  INSERT INTO public.credit_transactions (user_id, kind, amount, description, balance_after) SELECT _user_id, 'grant', _allow, 'Plan activated: ' || _plan_id, plan_credits + topup_credits FROM public.ai_credits WHERE user_id = _user_id;
  RETURN jsonb_build_object('ok', true, 'plan_id', _plan_id, 'domain_id', _domain_id, 'expires_at', _sub.expires_at);
END;
$function$;
REVOKE ALL ON FUNCTION public.activate_subscription(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_subscription(uuid, text, text, text, text) TO service_role;