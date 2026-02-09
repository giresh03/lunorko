
-- Fix overly permissive UPDATE policy on mentor_slots
DROP POLICY "Auth users can update slots" ON public.mentor_slots;

-- Only allow updating unbooked slots to mark them as booked
CREATE POLICY "Auth users can book available slots"
  ON public.mentor_slots FOR UPDATE
  TO authenticated
  USING (is_booked = false)
  WITH CHECK (is_booked = true);
