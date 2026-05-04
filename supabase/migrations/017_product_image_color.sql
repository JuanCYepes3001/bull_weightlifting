-- ============================================================
-- Migration: 017_product_image_color.sql
-- Add color column to product_images to support per-color images
-- ============================================================

ALTER TABLE product_images
  ADD COLUMN IF NOT EXISTS color TEXT;

CREATE INDEX IF NOT EXISTS idx_product_images_color ON product_images(product_id, color);
