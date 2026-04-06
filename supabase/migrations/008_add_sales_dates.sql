-- ============================================================
-- Add sales scheduled dates and automatic expire function
-- Migration: 008_add_sales_dates.sql
-- ============================================================

ALTER TABLE products
ADD COLUMN sale_start_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN sale_end_at TIMESTAMP WITH TIME ZONE;

-- Función para limpiar ofertas expiradas
CREATE OR REPLACE FUNCTION expire_products_offers()
RETURNS void AS $$
BEGIN
  UPDATE products
  SET 
    is_on_sale = false,
    sale_price = null,
    discount_percent = null,
    sale_start_at = null,
    sale_end_at = null,
    updated_at = now()
  WHERE is_on_sale = true 
    AND sale_end_at IS NOT NULL 
    AND sale_end_at < now();
END;
$$ LANGUAGE plpgsql;

-- Notar: Para automatizar esto en Supabase, se recomienda usar pg_cron
-- SELECT cron.schedule('cleanup-offers', '0 * * * *', 'SELECT expire_products_offers()');
