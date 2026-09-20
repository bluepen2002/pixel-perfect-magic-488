REVOKE ALL ON FUNCTION public.log_request_status() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.community_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.community_stats() TO anon, authenticated, service_role;