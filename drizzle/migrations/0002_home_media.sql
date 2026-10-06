CREATE TABLE public.home_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('image','video')),
  storage_path text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.home_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_media TO authenticated;
GRANT ALL ON public.home_media TO service_role;
ALTER TABLE public.home_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads published media" ON public.home_media FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "admins manage media" ON public.home_media FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "anyone views published home media" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'home-media' AND EXISTS (SELECT 1 FROM public.home_media m WHERE m.storage_path = storage.objects.name AND m.published));
CREATE POLICY "admins view home media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'home-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins upload home media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'home-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update home media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'home-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete home media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'home-media' AND public.has_role(auth.uid(),'admin'));