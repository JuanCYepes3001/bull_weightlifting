-- ============================================================
-- Bull Weightlifting — Functions & Triggers
-- Migration: 002_functions_triggers.sql
-- ============================================================


-- ─── Auto-update updated_at ───────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON product_variants;
CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_carts_updated_at ON carts;
CREATE TRIGGER trg_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON cart_items;
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ─── Auto-create profile on user signup ───────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL),
    CASE
      WHEN NEW.email = ANY(
        ARRAY(
          SELECT unnest(string_to_array(
            current_setting('app.admin_emails', true), ','
          ))
        )
      ) THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─── Merge guest cart into user cart on login ─────────────
CREATE OR REPLACE FUNCTION merge_guest_cart(
  p_session_id TEXT,
  p_user_id    UUID
)
RETURNS VOID AS $$
DECLARE
  v_guest_cart_id UUID;
  v_user_cart_id  UUID;
BEGIN
  -- Get or create user cart
  SELECT id INTO v_user_cart_id
  FROM carts
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_user_cart_id IS NULL THEN
    INSERT INTO carts (user_id) VALUES (p_user_id)
    RETURNING id INTO v_user_cart_id;
  END IF;

  -- Get guest cart
  SELECT id INTO v_guest_cart_id
  FROM carts
  WHERE session_id = p_session_id AND user_id IS NULL
  LIMIT 1;

  IF v_guest_cart_id IS NULL THEN
    RETURN;
  END IF;

  -- Merge items: upsert guest items into user cart
  INSERT INTO cart_items (cart_id, product_variant_id, quantity)
  SELECT v_user_cart_id, product_variant_id, quantity
  FROM cart_items
  WHERE cart_id = v_guest_cart_id
  ON CONFLICT (cart_id, product_variant_id)
  DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity;

  -- Delete guest cart (cascades to items)
  DELETE FROM carts WHERE id = v_guest_cart_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── Get product with full detail (variants + images) ─────
CREATE OR REPLACE FUNCTION get_product_detail(p_slug TEXT)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'id',          p.id,
    'name',        p.name,
    'slug',        p.slug,
    'description', p.description,
    'price',       p.price,
    'is_active',   p.is_active,
    'category',    json_build_object(
                     'id',     c.id,
                     'name',   c.name,
                     'slug',   c.slug,
                     'gender', c.gender
                   ),
    'variants',    COALESCE(
                     (SELECT json_agg(
                       json_build_object(
                         'id',    pv.id,
                         'size',  pv.size,
                         'color', pv.color,
                         'stock', pv.stock,
                         'sku',   pv.sku
                       ) ORDER BY pv.size, pv.color
                     ) FROM product_variants pv WHERE pv.product_id = p.id),
                     '[]'::JSON
                   ),
    'images',      COALESCE(
                     (SELECT json_agg(
                       json_build_object(
                         'id',       pi.id,
                         'url',      pi.url,
                         'alt',      pi.alt,
                         'position', pi.position
                       ) ORDER BY pi.position
                     ) FROM product_images pi WHERE pi.product_id = p.id),
                     '[]'::JSON
                   )
  ) INTO v_result
  FROM products p
  JOIN categories c ON c.id = p.category_id
  WHERE p.slug = p_slug AND p.is_active = TRUE;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;
