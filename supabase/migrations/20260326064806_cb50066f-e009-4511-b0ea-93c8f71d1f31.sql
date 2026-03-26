INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

CREATE POLICY "Public read access for resources" ON storage.objects FOR SELECT TO public USING (bucket_id = 'resources');

CREATE POLICY "Admins can upload resources" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resources" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));