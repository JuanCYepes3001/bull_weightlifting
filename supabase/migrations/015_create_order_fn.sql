-- Transactional order creation.
-- Inserts the order, order_items, and decrements stock for all items in a
-- single PL/pgSQL function. Because the function runs inside an implicit
-- transaction, any failure (network, insufficient stock, constraint violation)
-- rolls back ALL changes automatically — no orphan orders, no stale stock.
--
-- Replaces the multi-step JS approach in checkout.ts (insert order →
-- insert items → RPC decrement_stock per item) that could leave the DB
-- inconsistent if any intermediate step failed.
CREATE OR REPLACE FUNCTION create_order(
  p_user_id        uuid,
  p_status         text,
  p_total          numeric,
  p_shipping_address jsonb,
  p_payment_id     text,
  p_payment_status text,
  p_notes          text,
  p_items          jsonb  -- [{variant_id, quantity, unit_price}]
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id uuid;
  v_item     jsonb;
BEGIN
  -- 1. Insert order row
  INSERT INTO orders (
    user_id, status, total, shipping_address,
    payment_id, payment_status, notes
  ) VALUES (
    p_user_id, p_status::order_status, p_total, p_shipping_address,
    p_payment_id, p_payment_status, p_notes
  )
  RETURNING id INTO v_order_id;

  -- 2. Insert order_items + decrement stock for each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_variant_id, quantity, unit_price)
    VALUES (
      v_order_id,
      (v_item->>'variant_id')::uuid,
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric
    );

    UPDATE product_variants
    SET stock = stock - (v_item->>'quantity')::int
    WHERE id = (v_item->>'variant_id')::uuid
      AND stock >= (v_item->>'quantity')::int;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient_stock for variant %', v_item->>'variant_id';
    END IF;
  END LOOP;

  RETURN v_order_id;
END;
$$;
