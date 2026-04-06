-- ============================================================
-- Add sales fields to products table
-- Migration: 007_add_sales_fields.sql
-- ============================================================

ALTER TABLE products
ADD COLUMN is_on_sale BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN sale_price NUMERIC(12, 2) CHECK (sale_price >= 0),
ADD COLUMN discount_percent INT CHECK (discount_percent >= 0 AND discount_percent <= 100);

-- Solo permitir sale_price si is_on_sale es TRUE
ALTER TABLE products
ADD CONSTRAINT check_sale_price_active 
CHECK ((is_on_sale = FALSE) OR (sale_price IS NOT NULL OR discount_percent IS NOT NULL));

CREATE INDEX idx_products_on_sale ON products(is_on_sale);
