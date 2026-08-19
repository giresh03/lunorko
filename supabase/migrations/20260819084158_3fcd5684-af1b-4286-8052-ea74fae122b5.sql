CREATE OR REPLACE FUNCTION public.generate_username(_seed text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _base text; _candidate text; _i int := 0;
BEGIN
  _base := lower(regexp_replace(coalesce(_seed, 'user'), '[^a-zA-Z0-9_-]', '', 'g'));
  IF length(_base) < 3 THEN _base := _base || 'user'; END IF;
  _base := left(_base, 14);
  LOOP
    _candidate := _base || '_' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = lower(_candidate));
    _i := _i + 1;
    IF _i > 20 THEN _candidate := _base || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 5); EXIT; END IF;
  END LOOP;
  RETURN _candidate;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_username(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    public.generate_username(COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  );

  INSERT INTO public.ai_credits (user_id, plan_id, plan_credits, period_start)
  VALUES (NEW.id, 'free', public.plan_credit_allowance('free'), date_trunc('month', now())::date)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

UPDATE public.profiles p
SET username = public.generate_username(COALESCE(p.display_name, 'user'))
WHERE p.username IS NULL OR btrim(p.username) = '';