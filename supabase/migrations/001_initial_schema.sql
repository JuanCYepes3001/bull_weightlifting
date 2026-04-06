-- ============================================================
-- Bull Weightlifting — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search


-- ─── Enums ────────────────────────────────────────────────
CREATE TYPE user_role    AS ENUM ('user', 'admin');
CREATE TYPE gender_type  AS ENUM ('hombre', 'mujer', 'unisex');
CREATE TYPE order_status AS ENUM (
  'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);


-- ============================================================
-- PROFILES
-- Extends auth.users — one row per registered user
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  phone       TEXT,
  role        user_role NOT NULL DEFAULT 'user',
  addresses   JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT  profiles_user_id_unique UNIQUE (user_id)
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);


-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  gender      gender_type NOT NULL,
  image_url   TEXT,
  position    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_gender ON categories(gender);
CREATE INDEX idx_categories_slug   ON categories(slug);


-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  price        NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_is_active   ON products(is_active);
-- Full-text search index
CREATE INDEX idx_products_search ON products USING GIN (
  to_tsvector('spanish', name || ' ' || COALESCE(description, ''))
);


-- ============================================================
-- PRODUCT VARIANTS
-- Each combination of size + color per product
-- ============================================================
CREATE TABLE product_variants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        TEXT NOT NULL,
  color       TEXT NOT NULL,
  stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku         TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT  product_variants_unique UNIQUE (product_id, size, color)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_stock      ON product_variants(stock);


-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  position    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);


-- ============================================================
-- CARTS
-- Supports both authenticated users and guest sessions
-- ============================================================
CREATE TABLE carts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT  carts_owner CHECK (
    (user_id IS NOT NULL) OR (session_id IS NOT NULL)
  )
);

CREATE INDEX idx_carts_user_id    ON carts(user_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);


-- ============================================================
-- CART ITEMS
-- ============================================================
CREATE TABLE cart_items (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id              UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_variant_id   UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity             INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT           cart_items_unique UNIQUE (cart_id, product_variant_id)
);

CREATE INDEX idx_cart_items_cart_id            ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_variant_id ON cart_items(product_variant_id);


-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status            order_status NOT NULL DEFAULT 'pending',
  total             NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  shipping_address  JSONB NOT NULL,
  payment_id        TEXT,
  payment_status    TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status  ON orders(status);


-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id             UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id   UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity             INT NOT NULL CHECK (quantity > 0),
  unit_price           NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id           ON order_items(order_id);
CREATE INDEX idx_order_items_product_variant_id ON order_items(product_variant_id);
