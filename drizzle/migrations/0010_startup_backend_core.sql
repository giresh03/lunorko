-- 1. PAYMENT ORDERS
CREATE TABLE public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id text NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text,
  status text NOT NULL DEFAULT 'created',
  kind text NOT NULL DEFAULT 'subscription',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_orders TO authenticated;
GRANT ALL ON public.payment_orders TO service_role;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON public.payment_orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 2. INSTITUTIONS
CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  email_domain text,
  plan_id text NOT NULL DEFAULT 'pro',
  seats integer NOT NULL DEFAULT 0,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.institution_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'student',
  cohort text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, user_id)
);
CREATE TABLE public.institution_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'student',
  cohort text,
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.institutions TO authenticated;
GRANT ALL ON public.institutions TO service_role;
GRANT SELECT, INSERT, DELETE ON public.institution_members TO authenticated;
GRANT ALL ON public.institution_members TO service_role;
GRANT SELECT ON public.institution_invites TO authenticated;
GRANT ALL ON public.institution_invites TO service_role;

CREATE OR REPLACE FUNCTION public.is_institution_member(_user_id uuid, _institution_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.institution_members WHERE user_id = _user_id AND institution_id = _institution_id)
$$;

CREATE OR REPLACE FUNCTION public.is_institution_staff(_user_id uuid, _institution_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.institution_members
    WHERE user_id = _user_id AND institution_id = _institution_id
      AND role IN ('faculty','coordinator')
  )
$$;

CREATE OR REPLACE FUNCTION public.my_institution_ids(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT institution_id FROM public.institution_members WHERE user_id = _user_id
$$;

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view their institution" ON public.institutions FOR SELECT TO authenticated
  USING (public.is_institution_member(auth.uid(), id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage institutions" ON public.institutions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View members of own institution" ON public.institution_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_institution_staff(auth.uid(), institution_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Join own membership" ON public.institution_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Leave or remove membership" ON public.institution_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_institution_staff(auth.uid(), institution_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff view invites" ON public.institution_invites FOR SELECT TO authenticated
  USING (public.is_institution_staff(auth.uid(), institution_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage invites" ON public.institution_invites FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- institution-aware plan resolution
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT plan_id FROM public.subscriptions
      WHERE user_id = _user_id AND status = 'active' AND expires_at > now()
      ORDER BY expires_at DESC LIMIT 1),
    (SELECT i.plan_id FROM public.institution_members m
      JOIN public.institutions i ON i.id = m.institution_id
      WHERE m.user_id = _user_id AND i.status = 'active'
        AND (i.expires_at IS NULL OR i.expires_at > now())
      ORDER BY i.created_at DESC LIMIT 1),
    'free'
  )
$$;

-- join by invite code
CREATE OR REPLACE FUNCTION public.redeem_institution_invite(_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _inv public.institution_invites; _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  SELECT * INTO _inv FROM public.institution_invites WHERE lower(code) = lower(trim(_code));
  IF _inv.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid_code'); END IF;
  IF _inv.expires_at IS NOT NULL AND _inv.expires_at < now() THEN RETURN jsonb_build_object('ok', false, 'error', 'expired'); END IF;
  IF _inv.max_uses IS NOT NULL AND _inv.uses >= _inv.max_uses THEN RETURN jsonb_build_object('ok', false, 'error', 'exhausted'); END IF;

  INSERT INTO public.institution_members (institution_id, user_id, role, cohort)
  VALUES (_inv.institution_id, _uid, _inv.role, _inv.cohort)
  ON CONFLICT (institution_id, user_id) DO NOTHING;

  UPDATE public.institution_invites SET uses = uses + 1 WHERE id = _inv.id;
  PERFORM public.sync_ai_credits(_uid);
  RETURN jsonb_build_object('ok', true, 'institution_id', _inv.institution_id);
END;
$$;

-- 3. SUBSCRIPTION ACTIVATION
CREATE OR REPLACE FUNCTION public.activate_subscription(_user_id uuid, _plan_id text, _order_id text DEFAULT NULL, _payment_id text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _amount integer := 0; _sub public.subscriptions; _allow integer;
BEGIN
  SELECT price INTO _amount FROM public.subscription_plans WHERE id = _plan_id;

  UPDATE public.payment_orders
    SET status = 'paid', paid_at = now(), razorpay_payment_id = COALESCE(_payment_id, razorpay_payment_id)
    WHERE razorpay_order_id = _order_id;

  SELECT * INTO _sub FROM public.subscriptions
    WHERE user_id = _user_id AND plan_id = _plan_id AND status = 'active' AND expires_at > now()
    ORDER BY expires_at DESC LIMIT 1;

  IF _sub.id IS NOT NULL THEN
    UPDATE public.subscriptions SET expires_at = _sub.expires_at + interval '1 month',
      razorpay_payment_id = COALESCE(_payment_id, razorpay_payment_id),
      razorpay_order_id = COALESCE(_order_id, razorpay_order_id)
      WHERE id = _sub.id RETURNING * INTO _sub;
  ELSE
    INSERT INTO public.subscriptions (user_id, plan_id, status, amount, started_at, expires_at, razorpay_order_id, razorpay_payment_id)
    VALUES (_user_id, _plan_id, 'active', COALESCE(_amount, 0), now(), now() + interval '1 month', _order_id, _payment_id)
    RETURNING * INTO _sub;
  END IF;

  _allow := public.plan_credit_allowance(_plan_id);
  INSERT INTO public.ai_credits (user_id, plan_id, plan_credits, period_start)
  VALUES (_user_id, _plan_id, _allow, date_trunc('month', now())::date)
  ON CONFLICT (user_id) DO UPDATE
    SET plan_id = _plan_id, plan_credits = GREATEST(public.ai_credits.plan_credits, _allow),
        period_start = date_trunc('month', now())::date;

  INSERT INTO public.credit_transactions (user_id, kind, amount, description, balance_after)
  SELECT _user_id, 'grant', _allow, 'Plan activated: ' || _plan_id, plan_credits + topup_credits
  FROM public.ai_credits WHERE user_id = _user_id;

  RETURN jsonb_build_object('ok', true, 'plan_id', _plan_id, 'expires_at', _sub.expires_at);
END;
$$;

-- 4. ANALYTICS
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  institution_id uuid,
  event text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_event_time_idx ON public.analytics_events (event, created_at DESC);
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log events" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read events" ON public.analytics_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.metrics_overview()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT jsonb_build_object(
    'signups', (SELECT count(*) FROM public.profiles),
    'signups_30d', (SELECT count(*) FROM public.profiles WHERE created_at > now() - interval '30 days'),
    'active_students_30d', (SELECT count(DISTINCT user_id) FROM public.activity_log WHERE created_at > now() - interval '30 days'),
    'builds_total', (SELECT count(*) FROM public.workspace_history),
    'builds_30d', (SELECT count(*) FROM public.workspace_history WHERE created_at > now() - interval '30 days'),
    'paying_users', (SELECT count(DISTINCT user_id) FROM public.subscriptions WHERE status = 'active' AND expires_at > now() AND plan_id <> 'free'),
    'mrr_cents', (SELECT COALESCE(sum(p.price), 0) FROM public.subscriptions s JOIN public.subscription_plans p ON p.id = s.plan_id
                   WHERE s.status = 'active' AND s.expires_at > now() AND s.plan_id <> 'free'),
    'institutions', (SELECT count(*) FROM public.institutions WHERE status = 'active'),
    'institution_students', (SELECT count(*) FROM public.institution_members),
    'levels_completed', (SELECT count(*) FROM public.level_progress WHERE status = 'completed')
  ) INTO _r;
  RETURN _r;
END;
$$;

CREATE OR REPLACE FUNCTION public.metrics_daily(_days integer DEFAULT 30)
RETURNS TABLE(day date, signups bigint, active_users bigint, builds bigint, revenue_cents bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT d::date,
    (SELECT count(*) FROM public.profiles p WHERE p.created_at::date = d::date),
    (SELECT count(DISTINCT a.user_id) FROM public.activity_log a WHERE a.created_at::date = d::date),
    (SELECT count(*) FROM public.workspace_history w WHERE w.created_at::date = d::date),
    (SELECT COALESCE(sum(o.amount_cents), 0)::bigint FROM public.payment_orders o WHERE o.status = 'paid' AND o.paid_at::date = d::date)
  FROM generate_series((CURRENT_DATE - (GREATEST(_days,1) - 1) * interval '1 day')::date, CURRENT_DATE, interval '1 day') AS d
  ORDER BY d;
END;
$$;

CREATE OR REPLACE FUNCTION public.metrics_by_institution()
RETURNS TABLE(institution_id uuid, name text, students bigint, builds bigint, levels_completed bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT i.id, i.name,
    (SELECT count(*) FROM public.institution_members m WHERE m.institution_id = i.id),
    (SELECT count(*) FROM public.workspace_history w WHERE w.user_id IN (SELECT m.user_id FROM public.institution_members m WHERE m.institution_id = i.id)),
    (SELECT count(*) FROM public.level_progress lp WHERE lp.status = 'completed' AND lp.user_id IN (SELECT m.user_id FROM public.institution_members m WHERE m.institution_id = i.id))
  FROM public.institutions i
  ORDER BY i.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.metrics_retention()
RETURNS TABLE(cohort_week date, cohort_size bigint, week1 bigint, week2 bigint, week4 bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  WITH c AS (
    SELECT p.user_id, date_trunc('week', p.created_at)::date AS wk FROM public.profiles p
    WHERE p.created_at > now() - interval '12 weeks'
  )
  SELECT c.wk, count(*)::bigint,
    count(*) FILTER (WHERE EXISTS (SELECT 1 FROM public.activity_log a WHERE a.user_id = c.user_id AND a.created_at BETWEEN c.wk + interval '7 days' AND c.wk + interval '14 days'))::bigint,
    count(*) FILTER (WHERE EXISTS (SELECT 1 FROM public.activity_log a WHERE a.user_id = c.user_id AND a.created_at BETWEEN c.wk + interval '14 days' AND c.wk + interval '21 days'))::bigint,
    count(*) FILTER (WHERE EXISTS (SELECT 1 FROM public.activity_log a WHERE a.user_id = c.user_id AND a.created_at BETWEEN c.wk + interval '28 days' AND c.wk + interval '35 days'))::bigint
  FROM c GROUP BY c.wk ORDER BY c.wk;
END;
$$;

-- 5. SAVED USER PROJECTS
CREATE TABLE public.user_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  domain text NOT NULL DEFAULT 'web-development',
  prompt text,
  files jsonb NOT NULL DEFAULT '[]',
  runtime_project_id uuid REFERENCES public.runtime_projects(id) ON DELETE SET NULL,
  is_full_stack boolean NOT NULL DEFAULT false,
  thumbnail_url text,
  visibility text NOT NULL DEFAULT 'private',
  share_slug text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.user_project_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.user_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  label text,
  files jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX user_projects_user_idx ON public.user_projects (user_id, updated_at DESC);
CREATE INDEX user_project_versions_project_idx ON public.user_project_versions (project_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_projects TO authenticated;
GRANT SELECT ON public.user_projects TO anon;
GRANT ALL ON public.user_projects TO service_role;
GRANT SELECT, INSERT, DELETE ON public.user_project_versions TO authenticated;
GRANT ALL ON public.user_project_versions TO service_role;

ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_project_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own projects" ON public.user_projects FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Shared projects are readable" ON public.user_projects FOR SELECT TO anon, authenticated
  USING (visibility IN ('link','public'));

CREATE POLICY "Owners manage own versions" ON public.user_project_versions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_user_projects_updated_at BEFORE UPDATE ON public.user_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
