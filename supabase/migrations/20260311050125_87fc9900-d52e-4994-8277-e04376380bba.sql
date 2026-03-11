
CREATE TABLE public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id text NOT NULL,
  domain_id text NOT NULL,
  amount integer NOT NULL,
  utr_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own payment requests"
  ON public.payment_requests FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own payment requests"
  ON public.payment_requests FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment requests"
  ON public.payment_requests FOR SELECT TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payment requests"
  ON public.payment_requests FOR UPDATE TO public
  USING (has_role(auth.uid(), 'admin'::app_role));
