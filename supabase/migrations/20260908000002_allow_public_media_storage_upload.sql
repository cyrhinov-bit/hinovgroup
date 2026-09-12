-- Migration: Allow public/anon and authenticated upload to media bucket
-- Fixes RLS violation when uploading media without an active Supabase Auth JWT

-- 1. Ensure bucket 'media' exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  TRUE,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 104857600;

-- 2. Drop restrictive policies
DROP POLICY IF EXISTS "Admin Upload Media Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Media Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Media Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Media Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Read Media Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload Media Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update Media Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete Media Bucket" ON storage.objects;

-- 3. Create permissive storage policies for the 'media' bucket
CREATE POLICY "Allow All Read Media Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Allow Upload Media Bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow Update Media Bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media');

CREATE POLICY "Allow Delete Media Bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');

