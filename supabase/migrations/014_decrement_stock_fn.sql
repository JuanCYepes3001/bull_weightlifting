-- Atomic stock decrement.
-- Reduces stock by p_qty only if current stock >= p_qty (single UPDATE statement).
-- Raises 'insufficient_stock' if the row is not found or stock is too low,
-- which the caller (checkout.ts) maps to a user-facing error and order rollback.
CREATE OR REPLACE FUNCTION decrement_stock(p_variant_id uuid, p_qty int)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_variants
  SET stock = stock - p_qty
  WHERE id = p_variant_id AND stock >= p_qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_stock';
  END IF;
END;
$$;
