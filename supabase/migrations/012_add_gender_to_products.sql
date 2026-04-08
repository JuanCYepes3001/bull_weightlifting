-- ============================================================
-- Migration: 012_add_gender_to_products.sql
-- Add gender field to products (independent from category gender)
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS gender gender_type NOT NULL DEFAULT 'unisex';

CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
