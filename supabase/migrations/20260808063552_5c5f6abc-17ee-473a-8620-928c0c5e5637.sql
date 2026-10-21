DROP FUNCTION IF EXISTS public.consume_ai_credit(uuid, integer);
REVOKE ALL ON FUNCTION public.consume_ai_credit(uuid, integer, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_ai_credit(uuid, integer, text) FROM anon;
REVOKE ALL ON FUNCTION public.consume_ai_credit(uuid, integer, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_credit(uuid, integer, text) TO service_role;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;