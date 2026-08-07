-- 1. Mentor emails: column-level restriction
REVOKE SELECT ON public.mentors FROM anon, authenticated;
GRANT SELECT (id, name, company, role, domain_id, bio, avatar_url, meeting_link, years_experience, is_active, created_at, college_preparation, tech_stack, career_tips, journey_summary) ON public.mentors TO anon, authenticated;
GRANT ALL ON public.mentors TO service_role;

-- 2. Daily challenge solution code hidden from clients
REVOKE SELECT ON public.daily_challenges FROM anon, authenticated;
GRANT SELECT (id, domain_id, title, description, difficulty, hints, challenge_date, xp_reward, created_at) ON public.daily_challenges TO anon, authenticated;
GRANT ALL ON public.daily_challenges TO service_role;

-- 3. user_xp leaderboard requires authentication
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.user_xp;
CREATE POLICY "Authenticated users can view leaderboard"
  ON public.user_xp FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.user_xp FROM anon;

-- 4. mentor_slots: tie booking state changes to the user's own booking
DROP POLICY IF EXISTS "Auth users can book available slots" ON public.mentor_slots;
CREATE POLICY "Users can book slots they have a booking for"
  ON public.mentor_slots FOR UPDATE TO authenticated
  USING (
    is_booked = false
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.slot_id = mentor_slots.id AND b.student_id = auth.uid()
    )
  )
  WITH CHECK (is_booked = true);
CREATE POLICY "Users can release their own booked slots"
  ON public.mentor_slots FOR UPDATE TO authenticated
  USING (
    is_booked = true
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.slot_id = mentor_slots.id AND b.student_id = auth.uid()
    )
  )
  WITH CHECK (is_booked = false);

-- 5. Revoke direct EXECUTE on internal SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.count_unique_visitors() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.get_visitor_trends() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.update_post_likes_count() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.update_post_comments_count() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_plan(uuid) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.count_unique_visitors() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_visitor_trends() TO service_role;