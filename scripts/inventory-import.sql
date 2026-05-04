-- ============================================================
-- Bull Weightlifting — Importación de Inventario v3
-- Generado: 2026-05-04T18:33:21.730Z
--
-- Categorías : 8
-- Productos  : 14
-- Colores    : 32
-- Variantes  : 180
--
-- INSTRUCCIONES:
--   1. Asegúrate de que la migración 017 ya fue ejecutada
--        (columna "color" en product_images)
--   2. Ejecuta este archivo en Supabase SQL Editor
--   3. El bucket "products" debe ser PÚBLICO
--   4. Las imágenes deben llamarse "ITEM COLOR.jpg" en el bucket
--      Ejemplo: "CAMISA CUELLO REDONDO NEGRO.jpg"
-- ============================================================

BEGIN;

-- ─── CLEANUP: eliminar en orden correcto respetando FKs ──────────────────────
-- order_items.product_variant_id es NOT NULL → hay que borrar las filas, no nullificarlas.
-- cart_items también puede referenciar product_variants.
DELETE FROM order_items;
DELETE FROM cart_items;
DELETE FROM product_images;
DELETE FROM product_variants;
DELETE FROM products;
-- Las categorías se reusan con ON CONFLICT


-- ─── Categorías ────────────────────────────────────────────────
INSERT INTO categories (id, name, slug, gender, position)
VALUES ('3e42112b-59d2-4789-a0c7-688b20c6bfa3', 'Camisas', 'camisas', 'unisex', 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, gender = EXCLUDED.gender;

INSERT INTO categories (id, name, slug, gender, position)
VALUES ('774dd793-9c5a-4591-88d0-038ee426c853', 'Shorts', 'shorts', 'mujer', 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, gender = EXCLUDED.gender;

INSERT INTO categories (id, name, slug, gender, position)
VALUES ('391a1f46-7f73-4e1a-bf27-c03515619b8b', 'Toptanks', 'toptanks', 'mujer', 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, gender = EXCLUDED.gender;

INSERT INTO categories (id, name, slug, gender, position)
VALUES ('cbc23649-1ccb-43cb-95e9-261f1cde5d69', 'Busos', 'busos', 'hombre', 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, gender = EXCLUDED.gender;

INSERT INTO categories (id, name, slug, gender, position)
VALUES ('2256e38b-a7a3-40ae-b22b-aba5d3085b58', 'Licras', 'licras', 'hombre', 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, gender = EXCLUDED.gender;

INSERT INTO categories (id, name, slug, gender, position)
VALUES ('73e5ced2-f2c4-4115-954a-b4e9a84a3db0', 'Writsbandss', 'writsbandss', 'unisex', 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, gender = EXCLUDED.gender;

INSERT INTO categories (id, name, slug, gender, position)
VALUES ('1899b2ee-d5b7-407f-af7b-3bacca20034c', 'Sports', 'sports', 'mujer', 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, gender = EXCLUDED.gender;

INSERT INTO categories (id, name, slug, gender, position)
VALUES ('a3b3a6b0-e774-4436-9f7e-daa239385428', 'Trusas', 'trusas', 'unisex', 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, gender = EXCLUDED.gender;


-- ─── Productos (1 por tipo de prenda) ──────────────────────────
INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  '38a10c68-7975-4c44-ab65-da8a453731ed',
  'CamisaClasicaLogo',
  'camisaclasicalogo',
  'Fabricada en algodón licrado',
  85000.00,
  (SELECT id FROM categories WHERE slug = 'camisas'),
  'unisex',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  'd734901d-35e6-4ff5-8f01-e1f4713af1a6',
  'Short',
  'short',
  'Spandex algdono',
  65000.00,
  (SELECT id FROM categories WHERE slug = 'shorts'),
  'mujer',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  'c6234168-a509-4cdc-b25e-496f2b03b89f',
  'Toptank',
  'toptank',
  'Spandex algodon',
  55000.00,
  (SELECT id FROM categories WHERE slug = 'toptanks'),
  'mujer',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  '8b36f448-c3f4-4396-afc5-da6a054cf018',
  'CamisaCompression',
  'camisacompression',
  'Spandex algodon',
  85000.00,
  (SELECT id FROM categories WHERE slug = 'camisas'),
  'unisex',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  '825b1053-456b-44c0-bdff-73b2b6a6d028',
  'BusoCompression',
  'busocompression',
  'Spandex algodon',
  110000.00,
  (SELECT id FROM categories WHERE slug = 'busos'),
  'hombre',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  '6b19d55c-5a67-4e28-9252-ff1601af1f03',
  'ToptankCuelloAlto',
  'toptankcuelloalto',
  'Spandex algodon',
  90000.00,
  (SELECT id FROM categories WHERE slug = 'toptanks'),
  'mujer',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  '4d4f69ec-81ab-4e98-93d0-9a556746a29c',
  'CamisaMangaSizaRunning',
  'camisamangasizarunning',
  'Secado rapido especial para running y crossfit',
  75000.00,
  (SELECT id FROM categories WHERE slug = 'camisas'),
  'unisex',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  'a577d6fc-b9db-4809-9bf9-0f75d949db51',
  'ShortHombre',
  'shorthombre',
  'Spandex algodon',
  80000.00,
  (SELECT id FROM categories WHERE slug = 'shorts'),
  'mujer',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  '9ef804ba-5599-4b56-b081-fa636bfdb3be',
  'LicraLarga',
  'licralarga',
  'Spandex algodon',
  110000.00,
  (SELECT id FROM categories WHERE slug = 'licras'),
  'hombre',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  'f5728873-7107-420b-a8d3-d63a90ad1373',
  'Writsbands',
  'writsbands',
  'Full algodon',
  45000.00,
  (SELECT id FROM categories WHERE slug = 'writsbandss'),
  'unisex',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  '78021215-6b42-4283-8d4c-8288d71b4ac7',
  'SportBra',
  'sportbra',
  'Spandex algodon',
  75000.00,
  (SELECT id FROM categories WHERE slug = 'sports'),
  'mujer',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  'e2efb81e-71fe-4049-a513-7324a99363f9',
  'TrusaClasicapersonalizada',
  'trusaclasicapersonalizada',
  'Spandex algodon 320 gramos',
  235000.00,
  (SELECT id FROM categories WHERE slug = 'trusas'),
  'unisex',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  'a4eb7da4-0c87-433e-9564-90f8c1ec1a93',
  'TrusaMangasPersonalizada',
  'trusamangaspersonalizada',
  'Spandex algodon 390 gramos',
  258000.00,
  (SELECT id FROM categories WHERE slug = 'trusas'),
  'unisex',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  '87d3575e-9174-4b60-a62c-a5dc3863ac52',
  'TrusaAlbornozPersonalizada',
  'trusaalbornozpersonalizada',
  'Spandex algodon 310 gramos',
  262000.00,
  (SELECT id FROM categories WHERE slug = 'trusas'),
  'unisex',
  true
) ON CONFLICT (slug) DO NOTHING;


-- ─── Variantes (producto × color × talla) ──────────────────────
-- CamisaClasicaLogo  (11 colores, 55 variantes)
  -- Color: ROJO (#DC2626)  SKU base: 01_01_01
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XS', 'ROJO', '#DC2626', 1, '01_01_01_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'S', 'ROJO', '#DC2626', 2, '01_01_01_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'M', 'ROJO', '#DC2626', 2, '01_01_01_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'L', 'ROJO', '#DC2626', 1, '01_01_01_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XL', 'ROJO', '#DC2626', 1, '01_01_01_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: NEGRO (#000000)  SKU base: 01_01_02
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XS', 'NEGRO', '#000000', 2, '01_01_02_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'S', 'NEGRO', '#000000', 2, '01_01_02_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'M', 'NEGRO', '#000000', 4, '01_01_02_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'L', 'NEGRO', '#000000', 4, '01_01_02_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XL', 'NEGRO', '#000000', 2, '01_01_02_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: AMARILLO (#EAB308)  SKU base: 01_01_03
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XS', 'AMARILLO', '#EAB308', 1, '01_01_03_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'S', 'AMARILLO', '#EAB308', 1, '01_01_03_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'M', 'AMARILLO', '#EAB308', 1, '01_01_03_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'L', 'AMARILLO', '#EAB308', 2, '01_01_03_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XL', 'AMARILLO', '#EAB308', 1, '01_01_03_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: VERDE_MILITAR (#4B5320)  SKU base: 01_01_04
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XS', 'VERDE_MILITAR', '#4B5320', 1, '01_01_04_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'S', 'VERDE_MILITAR', '#4B5320', 1, '01_01_04_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'M', 'VERDE_MILITAR', '#4B5320', 2, '01_01_04_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'L', 'VERDE_MILITAR', '#4B5320', 3, '01_01_04_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XL', 'VERDE_MILITAR', '#4B5320', 2, '01_01_04_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: AZUL_MARINO (#1E3A5F)  SKU base: 01_01_05
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XS', 'AZUL_MARINO', '#1E3A5F', 2, '01_01_05_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'S', 'AZUL_MARINO', '#1E3A5F', 2, '01_01_05_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'M', 'AZUL_MARINO', '#1E3A5F', 2, '01_01_05_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'L', 'AZUL_MARINO', '#1E3A5F', 2, '01_01_05_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XL', 'AZUL_MARINO', '#1E3A5F', 2, '01_01_05_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: ROSADO (#EC4899)  SKU base: 01_01_06
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XS', 'ROSADO', '#EC4899', 3, '01_01_06_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'S', 'ROSADO', '#EC4899', 3, '01_01_06_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'M', 'ROSADO', '#EC4899', 3, '01_01_06_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'L', 'ROSADO', '#EC4899', 2, '01_01_06_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XL', 'ROSADO', '#EC4899', 1, '01_01_06_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: PALO_DE_ROSA (#E8A598)  SKU base: 01_01_07
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XS', 'PALO_DE_ROSA', '#E8A598', 1, '01_01_07_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'S', 'PALO_DE_ROSA', '#E8A598', 1, '01_01_07_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'M', 'PALO_DE_ROSA', '#E8A598', 1, '01_01_07_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'L', 'PALO_DE_ROSA', '#E8A598', 1, '01_01_07_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XL', 'PALO_DE_ROSA', '#E8A598', 1, '01_01_07_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: MORADO (#7C3AED)  SKU base: 01_01_08
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XS', 'MORADO', '#7C3AED', 1, '01_01_08_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'S', 'MORADO', '#7C3AED', 1, '01_01_08_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'M', 'MORADO', '#7C3AED', 1, '01_01_08_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'L', 'MORADO', '#7C3AED', 1, '01_01_08_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XL', 'MORADO', '#7C3AED', 1, '01_01_08_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: LILA (#C084FC)  SKU base: 01_01_09
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XS', 'LILA', '#C084FC', 1, '01_01_09_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'S', 'LILA', '#C084FC', 1, '01_01_09_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'M', 'LILA', '#C084FC', 1, '01_01_09_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'L', 'LILA', '#C084FC', 1, '01_01_09_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XL', 'LILA', '#C084FC', 1, '01_01_09_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: TERRACOTA (#C1614F)  SKU base: 01_01_10
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XS', 'TERRACOTA', '#C1614F', 1, '01_01_10_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'S', 'TERRACOTA', '#C1614F', 1, '01_01_10_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'M', 'TERRACOTA', '#C1614F', 1, '01_01_10_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'L', 'TERRACOTA', '#C1614F', 1, '01_01_10_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XL', 'TERRACOTA', '#C1614F', 1, '01_01_10_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: FUCSIA (#D6006E)  SKU base: 01_01_11
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XS', 'FUCSIA', '#D6006E', 1, '01_01_11_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'S', 'FUCSIA', '#D6006E', 1, '01_01_11_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'M', 'FUCSIA', '#D6006E', 2, '01_01_11_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'L', 'FUCSIA', '#D6006E', 1, '01_01_11_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'XL', 'FUCSIA', '#D6006E', 1, '01_01_11_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;

-- Short  (6 colores, 36 variantes)
  -- Color: NEGRO (#000000)  SKU base: 02_01_01
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XS', 'NEGRO', '#000000', 1, '02_01_01_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'S', 'NEGRO', '#000000', 1, '02_01_01_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'M', 'NEGRO', '#000000', 1, '02_01_01_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'L', 'NEGRO', '#000000', 1, '02_01_01_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XL', 'NEGRO', '#000000', 1, '02_01_01_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XXL', 'NEGRO', '#000000', 1, '02_01_01_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: AZUL_MARINO (#1E3A5F)  SKU base: 02_01_02
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XS', 'AZUL_MARINO', '#1E3A5F', 1, '02_01_02_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'S', 'AZUL_MARINO', '#1E3A5F', 1, '02_01_02_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'M', 'AZUL_MARINO', '#1E3A5F', 1, '02_01_02_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'L', 'AZUL_MARINO', '#1E3A5F', 1, '02_01_02_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XL', 'AZUL_MARINO', '#1E3A5F', 1, '02_01_02_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XXL', 'AZUL_MARINO', '#1E3A5F', 1, '02_01_02_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: AMARILLO (#EAB308)  SKU base: 02_01_03
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XS', 'AMARILLO', '#EAB308', 1, '02_01_03_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'S', 'AMARILLO', '#EAB308', 1, '02_01_03_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'M', 'AMARILLO', '#EAB308', 1, '02_01_03_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'L', 'AMARILLO', '#EAB308', 1, '02_01_03_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XL', 'AMARILLO', '#EAB308', 1, '02_01_03_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XXL', 'AMARILLO', '#EAB308', 1, '02_01_03_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: ROSADO (#EC4899)  SKU base: 02_01_04
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XS', 'ROSADO', '#EC4899', 1, '02_01_04_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'S', 'ROSADO', '#EC4899', 1, '02_01_04_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'M', 'ROSADO', '#EC4899', 1, '02_01_04_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'L', 'ROSADO', '#EC4899', 1, '02_01_04_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XL', 'ROSADO', '#EC4899', 1, '02_01_04_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XXL', 'ROSADO', '#EC4899', 1, '02_01_04_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: ROJO (#DC2626)  SKU base: 02_01_05
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XS', 'ROJO', '#DC2626', 1, '02_01_05_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'S', 'ROJO', '#DC2626', 1, '02_01_05_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'M', 'ROJO', '#DC2626', 1, '02_01_05_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'L', 'ROJO', '#DC2626', 1, '02_01_05_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XL', 'ROJO', '#DC2626', 1, '02_01_05_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XXL', 'ROJO', '#DC2626', 1, '02_01_05_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: VERDE_MILITAR (#4B5320)  SKU base: 02_01_06
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XS', 'VERDE_MILITAR', '#4B5320', 1, '02_01_06_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'S', 'VERDE_MILITAR', '#4B5320', 1, '02_01_06_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'M', 'VERDE_MILITAR', '#4B5320', 1, '02_01_06_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'L', 'VERDE_MILITAR', '#4B5320', 1, '02_01_06_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XL', 'VERDE_MILITAR', '#4B5320', 1, '02_01_06_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'XXL', 'VERDE_MILITAR', '#4B5320', 1, '02_01_06_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;

-- Toptank  (1 colores, 6 variantes)
  -- Color: NEGRO (#000000)  SKU base: 03_01_01
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('c6234168-a509-4cdc-b25e-496f2b03b89f', 'XS', 'NEGRO', '#000000', 2, '03_01_01_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('c6234168-a509-4cdc-b25e-496f2b03b89f', 'S', 'NEGRO', '#000000', 2, '03_01_01_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('c6234168-a509-4cdc-b25e-496f2b03b89f', 'M', 'NEGRO', '#000000', 2, '03_01_01_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('c6234168-a509-4cdc-b25e-496f2b03b89f', 'L', 'NEGRO', '#000000', 2, '03_01_01_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('c6234168-a509-4cdc-b25e-496f2b03b89f', 'XL', 'NEGRO', '#000000', 2, '03_01_01_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('c6234168-a509-4cdc-b25e-496f2b03b89f', 'XXL', 'NEGRO', '#000000', 2, '03_01_01_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;

-- CamisaCompression  (1 colores, 5 variantes)
  -- Color: NEGRO (#000000)  SKU base: 01_02_01
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('8b36f448-c3f4-4396-afc5-da6a054cf018', 'XS', 'NEGRO', '#000000', 1, '01_02_01_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('8b36f448-c3f4-4396-afc5-da6a054cf018', 'M', 'NEGRO', '#000000', 3, '01_02_01_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('8b36f448-c3f4-4396-afc5-da6a054cf018', 'L', 'NEGRO', '#000000', 4, '01_02_01_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('8b36f448-c3f4-4396-afc5-da6a054cf018', 'XL', 'NEGRO', '#000000', 2, '01_02_01_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('8b36f448-c3f4-4396-afc5-da6a054cf018', 'XXL', 'NEGRO', '#000000', 1, '01_02_01_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;

-- BusoCompression  (1 colores, 6 variantes)
  -- Color: NEGRO (#000000)  SKU base: 04_01_01
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('825b1053-456b-44c0-bdff-73b2b6a6d028', 'XS', 'NEGRO', '#000000', 1, '04_01_01_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('825b1053-456b-44c0-bdff-73b2b6a6d028', 'S', 'NEGRO', '#000000', 1, '04_01_01_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('825b1053-456b-44c0-bdff-73b2b6a6d028', 'M', 'NEGRO', '#000000', 5, '04_01_01_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('825b1053-456b-44c0-bdff-73b2b6a6d028', 'L', 'NEGRO', '#000000', 3, '04_01_01_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('825b1053-456b-44c0-bdff-73b2b6a6d028', 'XL', 'NEGRO', '#000000', 1, '04_01_01_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('825b1053-456b-44c0-bdff-73b2b6a6d028', 'XXL', 'NEGRO', '#000000', 1, '04_01_01_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;

-- ToptankCuelloAlto  (0 colores, 0 variantes)

-- CamisaMangaSizaRunning  (0 colores, 0 variantes)

-- ShortHombre  (1 colores, 6 variantes)
  -- Color: NEGRO (#000000)  SKU base: 02_02_01
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('a577d6fc-b9db-4809-9bf9-0f75d949db51', 'XS', 'NEGRO', '#000000', 2, '02_02_01_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('a577d6fc-b9db-4809-9bf9-0f75d949db51', 'S', 'NEGRO', '#000000', 2, '02_02_01_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('a577d6fc-b9db-4809-9bf9-0f75d949db51', 'M', 'NEGRO', '#000000', 2, '02_02_01_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('a577d6fc-b9db-4809-9bf9-0f75d949db51', 'L', 'NEGRO', '#000000', 2, '02_02_01_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('a577d6fc-b9db-4809-9bf9-0f75d949db51', 'XL', 'NEGRO', '#000000', 2, '02_02_01_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('a577d6fc-b9db-4809-9bf9-0f75d949db51', 'XXL', 'NEGRO', '#000000', 2, '02_02_01_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;

-- LicraLarga  (1 colores, 6 variantes)
  -- Color: NEGRO (#000000)  SKU base: 05_01_01
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('9ef804ba-5599-4b56-b081-fa636bfdb3be', 'XS', 'NEGRO', '#000000', 1, '05_01_01_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('9ef804ba-5599-4b56-b081-fa636bfdb3be', 'S', 'NEGRO', '#000000', 1, '05_01_01_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('9ef804ba-5599-4b56-b081-fa636bfdb3be', 'M', 'NEGRO', '#000000', 1, '05_01_01_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('9ef804ba-5599-4b56-b081-fa636bfdb3be', 'L', 'NEGRO', '#000000', 1, '05_01_01_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('9ef804ba-5599-4b56-b081-fa636bfdb3be', 'XL', 'NEGRO', '#000000', 1, '05_01_01_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('9ef804ba-5599-4b56-b081-fa636bfdb3be', 'XXL', 'NEGRO', '#000000', 1, '05_01_01_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;

-- Writsbands  (6 colores, 36 variantes)
  -- Color: ROJO (#DC2626)  SKU base: 06_01_01
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XS', 'ROJO', '#DC2626', 1, '06_01_01_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'S', 'ROJO', '#DC2626', 1, '06_01_01_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'M', 'ROJO', '#DC2626', 1, '06_01_01_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'L', 'ROJO', '#DC2626', 1, '06_01_01_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XL', 'ROJO', '#DC2626', 1, '06_01_01_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XXL', 'ROJO', '#DC2626', 1, '06_01_01_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: AZUL (#2563EB)  SKU base: 06_01_02
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XS', 'AZUL', '#2563EB', 1, '06_01_02_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'S', 'AZUL', '#2563EB', 1, '06_01_02_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'M', 'AZUL', '#2563EB', 1, '06_01_02_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'L', 'AZUL', '#2563EB', 1, '06_01_02_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XL', 'AZUL', '#2563EB', 1, '06_01_02_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XXL', 'AZUL', '#2563EB', 1, '06_01_02_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: NEGRO (#000000)  SKU base: 06_01_03
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XS', 'NEGRO', '#000000', 1, '06_01_03_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'S', 'NEGRO', '#000000', 1, '06_01_03_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'M', 'NEGRO', '#000000', 1, '06_01_03_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'L', 'NEGRO', '#000000', 1, '06_01_03_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XL', 'NEGRO', '#000000', 1, '06_01_03_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XXL', 'NEGRO', '#000000', 1, '06_01_03_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: AMARILLO (#EAB308)  SKU base: 06_01_04
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XS', 'AMARILLO', '#EAB308', 1, '06_01_04_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'S', 'AMARILLO', '#EAB308', 1, '06_01_04_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'M', 'AMARILLO', '#EAB308', 1, '06_01_04_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'L', 'AMARILLO', '#EAB308', 1, '06_01_04_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XL', 'AMARILLO', '#EAB308', 1, '06_01_04_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XXL', 'AMARILLO', '#EAB308', 1, '06_01_04_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: BLANCO (#FFFFFF)  SKU base: 06_01_05
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XS', 'BLANCO', '#FFFFFF', 1, '06_01_05_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'S', 'BLANCO', '#FFFFFF', 1, '06_01_05_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'M', 'BLANCO', '#FFFFFF', 1, '06_01_05_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'L', 'BLANCO', '#FFFFFF', 1, '06_01_05_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XL', 'BLANCO', '#FFFFFF', 1, '06_01_05_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XXL', 'BLANCO', '#FFFFFF', 1, '06_01_05_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: ROSADO (#EC4899)  SKU base: 06_01_06
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XS', 'ROSADO', '#EC4899', 1, '06_01_06_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'S', 'ROSADO', '#EC4899', 1, '06_01_06_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'M', 'ROSADO', '#EC4899', 1, '06_01_06_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'L', 'ROSADO', '#EC4899', 1, '06_01_06_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XL', 'ROSADO', '#EC4899', 1, '06_01_06_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'XXL', 'ROSADO', '#EC4899', 1, '06_01_06_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;

-- SportBra  (4 colores, 24 variantes)
  -- Color: VERDE (#16A34A)  SKU base: 07_01_01
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XS', 'VERDE', '#16A34A', 1, '07_01_01_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'S', 'VERDE', '#16A34A', 1, '07_01_01_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'M', 'VERDE', '#16A34A', 1, '07_01_01_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'L', 'VERDE', '#16A34A', 1, '07_01_01_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XL', 'VERDE', '#16A34A', 1, '07_01_01_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XXL', 'VERDE', '#16A34A', 1, '07_01_01_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: LILA (#C084FC)  SKU base: 07_01_02
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XS', 'LILA', '#C084FC', 1, '07_01_02_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'S', 'LILA', '#C084FC', 1, '07_01_02_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'M', 'LILA', '#C084FC', 1, '07_01_02_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'L', 'LILA', '#C084FC', 1, '07_01_02_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XL', 'LILA', '#C084FC', 1, '07_01_02_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XXL', 'LILA', '#C084FC', 1, '07_01_02_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: NEGRO (#000000)  SKU base: 07_01_03
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XS', 'NEGRO', '#000000', 1, '07_01_03_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'S', 'NEGRO', '#000000', 1, '07_01_03_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'M', 'NEGRO', '#000000', 1, '07_01_03_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'L', 'NEGRO', '#000000', 1, '07_01_03_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XL', 'NEGRO', '#000000', 1, '07_01_03_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XXL', 'NEGRO', '#000000', 1, '07_01_03_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
  -- Color: ROSADO (#EC4899)  SKU base: 07_01_04
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XS', 'ROSADO', '#EC4899', 1, '07_01_04_XS')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'S', 'ROSADO', '#EC4899', 1, '07_01_04_S')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'M', 'ROSADO', '#EC4899', 1, '07_01_04_M')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'L', 'ROSADO', '#EC4899', 1, '07_01_04_L')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XL', 'ROSADO', '#EC4899', 1, '07_01_04_XL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'XXL', 'ROSADO', '#EC4899', 1, '07_01_04_XXL')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;

-- TrusaClasicapersonalizada  (0 colores, 0 variantes)

-- TrusaMangasPersonalizada  (0 colores, 0 variantes)

-- TrusaAlbornozPersonalizada  (0 colores, 0 variantes)


-- ─── Imágenes (una por color) ──────────────────────────────────
-- Nombre en bucket: "ITEM COLOR.jpg"  ej: "CAMISA CUELLO REDONDO NEGRO.jpg"
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20ROJO.jpg', 'CamisaClasicaLogo ROJO', 'ROJO', 0);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20NEGRO.jpg', 'CamisaClasicaLogo NEGRO', 'NEGRO', 1);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20AMARILLO.jpg', 'CamisaClasicaLogo AMARILLO', 'AMARILLO', 2);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20VERDE_MILITAR.jpg', 'CamisaClasicaLogo VERDE_MILITAR', 'VERDE_MILITAR', 3);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20AZUL_MARINO.jpg', 'CamisaClasicaLogo AZUL_MARINO', 'AZUL_MARINO', 4);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20ROSADO.jpg', 'CamisaClasicaLogo ROSADO', 'ROSADO', 5);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20PALO_DE_ROSA.jpg', 'CamisaClasicaLogo PALO_DE_ROSA', 'PALO_DE_ROSA', 6);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20MORADO.jpg', 'CamisaClasicaLogo MORADO', 'MORADO', 7);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20LILA.jpg', 'CamisaClasicaLogo LILA', 'LILA', 8);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20TERRACOTA.jpg', 'CamisaClasicaLogo TERRACOTA', 'TERRACOTA', 9);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('38a10c68-7975-4c44-ab65-da8a453731ed', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20FUCSIA.jpg', 'CamisaClasicaLogo FUCSIA', 'FUCSIA', 10);

INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Short%20NEGRO.jpg', 'Short NEGRO', 'NEGRO', 0);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Short%20AZUL_MARINO.jpg', 'Short AZUL_MARINO', 'AZUL_MARINO', 1);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Short%20AMARILLO.jpg', 'Short AMARILLO', 'AMARILLO', 2);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Short%20ROSADO.jpg', 'Short ROSADO', 'ROSADO', 3);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Short%20ROJO.jpg', 'Short ROJO', 'ROJO', 4);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('d734901d-35e6-4ff5-8f01-e1f4713af1a6', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Short%20VERDE_MILITAR.jpg', 'Short VERDE_MILITAR', 'VERDE_MILITAR', 5);

INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('c6234168-a509-4cdc-b25e-496f2b03b89f', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Toptank%20NEGRO.jpg', 'Toptank NEGRO', 'NEGRO', 0);

INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('8b36f448-c3f4-4396-afc5-da6a054cf018', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaCompression%20NEGRO.jpg', 'CamisaCompression NEGRO', 'NEGRO', 0);

INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('825b1053-456b-44c0-bdff-73b2b6a6d028', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/BusoCompression%20NEGRO.jpg', 'BusoCompression NEGRO', 'NEGRO', 0);



INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('a577d6fc-b9db-4809-9bf9-0f75d949db51', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/ShortHombre%20NEGRO.jpg', 'ShortHombre NEGRO', 'NEGRO', 0);

INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('9ef804ba-5599-4b56-b081-fa636bfdb3be', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/LicraLarga%20NEGRO.jpg', 'LicraLarga NEGRO', 'NEGRO', 0);

INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Writsbands%20ROJO.jpg', 'Writsbands ROJO', 'ROJO', 0);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Writsbands%20AZUL.jpg', 'Writsbands AZUL', 'AZUL', 1);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Writsbands%20NEGRO.jpg', 'Writsbands NEGRO', 'NEGRO', 2);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Writsbands%20AMARILLO.jpg', 'Writsbands AMARILLO', 'AMARILLO', 3);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Writsbands%20BLANCO.jpg', 'Writsbands BLANCO', 'BLANCO', 4);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('f5728873-7107-420b-a8d3-d63a90ad1373', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Writsbands%20ROSADO.jpg', 'Writsbands ROSADO', 'ROSADO', 5);

INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/SportBra%20VERDE.jpg', 'SportBra VERDE', 'VERDE', 0);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/SportBra%20LILA.jpg', 'SportBra LILA', 'LILA', 1);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/SportBra%20NEGRO.jpg', 'SportBra NEGRO', 'NEGRO', 2);
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('78021215-6b42-4283-8d4c-8288d71b4ac7', 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/SportBra%20ROSADO.jpg', 'SportBra ROSADO', 'ROSADO', 3);




COMMIT;
