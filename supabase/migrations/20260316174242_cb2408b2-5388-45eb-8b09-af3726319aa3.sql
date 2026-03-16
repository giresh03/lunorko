-- Remove the overly permissive INSERT policy that allows users to self-grant subscriptions
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;