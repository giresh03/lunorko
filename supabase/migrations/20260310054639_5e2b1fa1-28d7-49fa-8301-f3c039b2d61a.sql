
-- Create community-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('community-images', 'community-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Auth users can upload community images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'community-images');

-- Allow anyone to view community images (public bucket)
CREATE POLICY "Anyone can view community images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'community-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own community images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'community-images' AND (storage.foldername(name))[1] = auth.uid()::text);
