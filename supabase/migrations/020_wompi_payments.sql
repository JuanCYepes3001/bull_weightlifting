-- Wompi payment gateway + order-creation hardening.
--
-- 1. Orders can no longer be inserted directly by end users. Before this,
--    the "orders_insert_own" policy and the public create_order RPC let any
--    logged-in user create an order with payment_status = 'approved' from the
--    browser (Supabase REST) without paying. Orders are now created only by
--    the server (service role) after it verifies prices and payment.
-- 2. apply_payment_result(): atomically moves an order from "waiting for the
--    gateway" to paid or cancelled (releasing reserved stock). Idempotent, so
--    the webhook, the return page and the expiry job can all call it safely.

-- ── 1. Lock down order creation ─────────────────────────────
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;

REVOKE EXECUTE ON FUNCTION create_order(uuid, text, numeric, jsonb, text, text, text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION create_order(uuid, text, numeric, jsonb, text, text, text, jsonb)
  TO service_role;

-- Orders are looked up by gateway reference (payment_id)
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);

-- ── 2. Apply a gateway result to an order ───────────────────
-- p_result: 'approved' | 'declined'
-- p_amount: amount charged by the gateway in COP (NULL = skip the check)
-- Returns: 'approved' | 'declined' | 'amount_mismatch' | 'noop' | 'not_found'
CREATE OR REPLACE FUNCTION apply_payment_result(
  p_payment_id text,
  p_result     text,
  p_amount     numeric
) RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM orders WHERE payment_id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;

  IF p_result = 'approved' THEN
    IF v_order.payment_status = 'approved' THEN
      RETURN 'noop';
    END IF;

    IF p_amount IS NOT NULL AND round(v_order.total) <> round(p_amount) THEN
      UPDATE orders
      SET payment_status = 'amount_mismatch', updated_at = now()
      WHERE id = v_order.id;
      RETURN 'amount_mismatch';
    END IF;

    -- Paid after the order had already expired/cancelled: re-reserve stock.
    -- GREATEST avoids failing a paid order on stock that sold out meanwhile;
    -- the admin sees the order and resolves it manually.
    IF v_order.status = 'cancelled' THEN
      UPDATE product_variants pv
      SET stock = GREATEST(pv.stock - oi.qty, 0)
      FROM (
        SELECT product_variant_id, SUM(quantity) AS qty
        FROM order_items WHERE order_id = v_order.id
        GROUP BY product_variant_id
      ) oi
      WHERE pv.id = oi.product_variant_id;
    END IF;

    UPDATE orders
    SET payment_status = 'approved',
        status = CASE WHEN status = 'cancelled' THEN 'pending'::order_status ELSE status END,
        updated_at = now()
    WHERE id = v_order.id;
    RETURN 'approved';
  END IF;

  IF p_result = 'declined' THEN
    -- Only orders still waiting for the gateway can be auto-cancelled
    IF v_order.payment_status <> 'wompi_pending' THEN
      RETURN 'noop';
    END IF;

    UPDATE product_variants pv
    SET stock = pv.stock + oi.qty
    FROM (
      SELECT product_variant_id, SUM(quantity) AS qty
      FROM order_items WHERE order_id = v_order.id
      GROUP BY product_variant_id
    ) oi
    WHERE pv.id = oi.product_variant_id;

    UPDATE orders
    SET payment_status = 'declined', status = 'cancelled', updated_at = now()
    WHERE id = v_order.id;
    RETURN 'declined';
  END IF;

  RAISE EXCEPTION 'invalid p_result %', p_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION apply_payment_result(text, text, numeric)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION apply_payment_result(text, text, numeric) TO service_role;
