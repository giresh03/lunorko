REVOKE ALL ON FUNCTION public.activate_subscription(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_subscription(uuid, text, text, text) TO service_role;

REVOKE ALL ON FUNCTION public.metrics_overview() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.metrics_daily(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.metrics_by_institution() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.metrics_retention() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.metrics_overview() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.metrics_daily(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.metrics_by_institution() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.metrics_retention() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.redeem_institution_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_institution_invite(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_institution_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_institution_staff(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_institution_ids(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_institution_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_institution_staff(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.my_institution_ids(uuid) TO authenticated, service_role;
