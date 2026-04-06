-- ============================================================
-- Bull Weightlifting — Row Level Security Policies
-- Migration: 003_rls_policies.sql
-- ============================================================

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function: is current user admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'admin';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;


-- ─── Enable RLS on all tables ─────────────────────────────
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items      ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- PROFILES
-- ============================================================
-- Users can only read/update their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Prevent users from elevating their own role
    AND (role = (SELECT role FROM profiles WHERE user_id = auth.uid()))
  );

-- Admin full access
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (is_admin());


-- ============================================================
-- CATEGORIES — public read, admin write
-- ============================================================
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (TRUE);

CREATE POLICY "categories_admin_write"
  ON categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());


-- ============================================================
-- PRODUCTS — public read (active only), admin all
-- ============================================================
CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "products_admin_all"
  ON products FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());


-- ============================================================
-- PRODUCT VARIANTS — public read, admin write
-- ============================================================
CREATE POLICY "product_variants_public_read"
  ON product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND (p.is_active = TRUE OR is_admin())
    )
  );

CREATE POLICY "product_variants_admin_all"
  ON product_variants FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());


-- ============================================================
-- PRODUCT IMAGES — public read, admin write
-- ============================================================
CREATE POLICY "product_images_public_read"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND (p.is_active = TRUE OR is_admin())
    )
  );

CREATE POLICY "product_images_admin_all"
  ON product_images FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());


-- ============================================================
-- CARTS — users own their cart, guests via session_id
-- ============================================================
CREATE POLICY "carts_select_own"
  ON carts FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND session_id IS NOT NULL)
    OR is_admin()
  );

CREATE POLICY "carts_insert_own"
  ON carts FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "carts_update_own"
  ON carts FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "carts_delete_own"
  ON carts FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND session_id IS NOT NULL)
    OR is_admin()
  );


-- ============================================================
-- CART ITEMS — scoped through carts
-- ============================================================
CREATE POLICY "cart_items_select_own"
  ON cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_id
        AND (
          (auth.uid() IS NOT NULL AND c.user_id = auth.uid())
          OR (auth.uid() IS NULL AND c.session_id IS NOT NULL)
          OR is_admin()
        )
    )
  );

CREATE POLICY "cart_items_insert_own"
  ON cart_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_id
        AND (
          (auth.uid() IS NOT NULL AND c.user_id = auth.uid())
          OR (auth.uid() IS NULL AND c.session_id IS NOT NULL)
        )
    )
  );

CREATE POLICY "cart_items_update_own"
  ON cart_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_id
        AND (
          (auth.uid() IS NOT NULL AND c.user_id = auth.uid())
          OR (auth.uid() IS NULL AND c.session_id IS NOT NULL)
        )
    )
  );

CREATE POLICY "cart_items_delete_own"
  ON cart_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_id
        AND (
          (auth.uid() IS NOT NULL AND c.user_id = auth.uid())
          OR (auth.uid() IS NULL AND c.session_id IS NOT NULL)
          OR is_admin()
        )
    )
  );


-- ============================================================
-- ORDERS — users see own orders, admin sees all
-- ============================================================
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "orders_insert_own"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE
  USING (is_admin());

CREATE POLICY "orders_delete_admin"
  ON orders FOR DELETE
  USING (is_admin());


-- ============================================================
-- ORDER ITEMS — scoped through orders
-- ============================================================
CREATE POLICY "order_items_select_own"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND (o.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "order_items_insert_own"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_admin_all"
  ON order_items FOR ALL
  USING (is_admin());
