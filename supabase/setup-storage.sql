-- =====================================================
-- CONFIGURATION DU STOCKAGE PHOTOS - MrBrico Immo
-- Copie ce SQL dans Supabase > SQL Editor et clique Run
-- =====================================================

-- 1. Créer le bucket "photos" s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Permettre aux utilisateurs authentifiés d'uploader des photos
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM work_requests
  )
);

-- 3. Permettre à tous de lire les photos (bucket public)
DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

-- 4. Permettre aux utilisateurs authentifiés de supprimer leurs propres photos
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM work_requests
    WHERE manager_id IN (
      SELECT id FROM property_managers WHERE user_id = auth.uid()
    )
  )
);

-- 5. Permettre aux admins de tout gérer
DROP POLICY IF EXISTS "Admins can manage all photos" ON storage.objects;
CREATE POLICY "Admins can manage all photos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- VÉRIFICATIONS
-- =====================================================

-- Vérifier que le bucket existe et est public
SELECT id, name, public FROM storage.buckets WHERE id = 'photos';

-- Lister les politiques du bucket
SELECT * FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%photo%';
