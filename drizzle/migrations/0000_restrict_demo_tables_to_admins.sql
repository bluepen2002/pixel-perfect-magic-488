DROP POLICY "anyone reads sample members" ON public.demo_members;
DROP POLICY "anyone reads sample contributions" ON public.demo_contributions;
DROP POLICY "anyone reads sample requests" ON public.demo_requests;
REVOKE SELECT ON public.demo_members FROM anon;
REVOKE SELECT ON public.demo_contributions FROM anon;
REVOKE SELECT ON public.demo_requests FROM anon;
COMMENT ON TABLE public.demo_members IS 'DEPRECATED: sample data removed 2026-10-04; table kept for possible future demo use, admin-only.';
COMMENT ON TABLE public.demo_contributions IS 'DEPRECATED: sample data removed 2026-10-04; table kept for possible future demo use, admin-only.';
COMMENT ON TABLE public.demo_requests IS 'DEPRECATED: sample data removed 2026-10-04; table kept for possible future demo use, admin-only.';