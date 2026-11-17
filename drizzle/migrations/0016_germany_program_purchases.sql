CREATE TABLE public.internship_program_purchases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 program_id text NOT NULL,
 amount integer NOT NULL CHECK (amount > 0),
 currency text NOT NULL DEFAULT 'INR',
 status text NOT NULL DEFAULT 'paid' CHECK (status = 'paid'),
 razorpay_order_id text NOT NULL UNIQUE,
 razorpay_payment_id text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.internship_program_purchases TO authenticated;
GRANT ALL ON public.internship_program_purchases TO service_role;
ALTER TABLE public.internship_program_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers read own program purchases" ON public.internship_program_purchases FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE INDEX internship_program_purchases_user_program_idx ON public.internship_program_purchases (user_id, program_id);
ALTER TABLE public.payment_orders ADD COLUMN program_id text;
