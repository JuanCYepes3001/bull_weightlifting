-- ============================================================
-- Bull Weightlifting — Supabase Storage Buckets
-- Migration: 004_storage.sql
-- Run in Supabase SQL Editor after enabling Storage
-- ============================================================

-- ─── Products bucket (public) ─────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- ─── Avatars bucket (public) ──────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- ─── Storage RLS Policies ─────────────────────────────────

-- Products: public read
CREATE POLICY "products_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Products: admin upload/update/delete
CREATE POLICY "products_storage_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND is_admin());

CREATE POLICY "products_storage_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products' AND is_admin());

CREATE POLICY "products_storage_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND is_admin());

-- Avatars: public read
CREATE POLICY "avatars_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Avatars: users manage their own
CREATE POLICY "avatars_storage_user_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars_storage_user_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
