-- ============================================================
-- Migration: 011_add_color_hex_to_variants.sql
-- Add color_hex column to product_variants
-- ============================================================

ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS color_hex TEXT;
