/*
  # Setup Photo Storage for Medições

  1. Storage Setup
    - Create storage bucket for medicao photos
    - Configure public access policies
    - Set up RLS policies for secure access

  2. Security
    - Users can only access photos from authorized clients
    - Admins have full access
    - Public read access for photos (with path-based security)
*/

-- Create storage bucket for medicao photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medicao-photos',
  'medicao-photos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to upload photos
-- Only to paths that match their authorized clients
CREATE POLICY "Authenticated users can upload medicao photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'medicao-photos' 
  AND (
    -- Admin can upload anywhere
    is_admin()
    OR
    -- Regular users can only upload to authorized client folders
    (
      (storage.foldername(name))[1]::bigint IN (
        SELECT client_id 
        FROM client_users 
        WHERE user_id = auth.uid()
      )
    )
  )
);

-- Policy for authenticated users to update photos
-- Only their own client photos
CREATE POLICY "Authenticated users can update medicao photos" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'medicao-photos'
  AND (
    -- Admin can update anywhere
    is_admin()
    OR
    -- Regular users can only update authorized client photos
    (
      (storage.foldername(name))[1]::bigint IN (
        SELECT client_id 
        FROM client_users 
        WHERE user_id = auth.uid()
      )
    )
  )
);

-- Policy for authenticated users to delete photos
-- Only their own client photos
CREATE POLICY "Authenticated users can delete medicao photos" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'medicao-photos'
  AND (
    -- Admin can delete anywhere
    is_admin()
    OR
    -- Regular users can only delete authorized client photos
    (
      (storage.foldername(name))[1]::bigint IN (
        SELECT client_id 
        FROM client_users 
        WHERE user_id = auth.uid()
      )
    )
  )
);

-- Policy for public read access to photos
-- Photos are public once uploaded (security is handled at upload level)
CREATE POLICY "Public read access to medicao photos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'medicao-photos');

-- Update medicao_photos table policies to handle the new workflow

-- Enable insert for authenticated users with proper validation
CREATE POLICY "Authenticated users can insert photo records" ON medicao_photos
FOR INSERT TO authenticated
WITH CHECK (
  -- Admin can insert anywhere
  is_admin()
  OR
  -- Regular users can only insert for authorized medicao items
  (
    EXISTS (
      SELECT 1 
      FROM medicao_items mi
      JOIN medicao m ON (m.id = mi.medicao_id)
      JOIN client_users cu ON (cu.client_id = m.cliente_id)
      WHERE mi.id = medicao_photos.medicao_item_id
      AND cu.user_id = auth.uid()
    )
  )
);

-- Update policy for authenticated users to update photo records
CREATE POLICY "Authenticated users can update photo records" ON medicao_photos
FOR UPDATE TO authenticated
USING (
  -- Admin can update anywhere
  is_admin()
  OR
  -- Regular users can only update authorized photo records
  (
    EXISTS (
      SELECT 1 
      FROM medicao_items mi
      JOIN medicao m ON (m.id = mi.medicao_id)
      JOIN client_users cu ON (cu.client_id = m.cliente_id)
      WHERE mi.id = medicao_photos.medicao_item_id
      AND cu.user_id = auth.uid()
    )
  )
);

-- Delete policy for photo records
CREATE POLICY "Authenticated users can delete photo records" ON medicao_photos
FOR DELETE TO authenticated
USING (
  -- Admin can delete anywhere
  is_admin()
  OR
  -- Regular users can only delete authorized photo records
  (
    EXISTS (
      SELECT 1 
      FROM medicao_items mi
      JOIN medicao m ON (m.id = mi.medicao_id)
      JOIN client_users cu ON (cu.client_id = m.cliente_id)
      WHERE mi.id = medicao_photos.medicao_item_id
      AND cu.user_id = auth.uid()
    )
  )
);