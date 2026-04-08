-- ============================================================
-- Fix categories: merge gender-specific → unified + Trusos → Trusas
-- Migration: 013_fix_categories.sql
-- ============================================================

-- 1. Insert unified categories (idempotent)
INSERT INTO categories (name, slug, gender, position) VALUES
  ('Camisetas',           'camisetas',        'unisex', 1),
  ('Trusas',              'trusas',           'unisex', 2),
  ('Shorts',              'shorts',           'unisex', 3),
  ('Sudaderas',           'sudaderas',        'unisex', 4),
  ('Leggings',            'leggings',         'unisex', 5),
  ('Sports Bras',         'sports-bras',      'mujer',  6),
  ('Tops Deportivos',     'tops',             'unisex', 7),
  ('Busos Compresión',    'busos-compresion', 'unisex', 8),
  ('Crop Tops Compresión','crop-tops',        'mujer',  9),
  ('Licras Largas',       'licras',           'unisex', 10),
  ('Accesorios',          'accesorios',       'unisex', 11)
ON CONFLICT (slug) DO NOTHING;

-- 2. Migrate products from old gender-specific categories to unified ones

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'camisetas')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('camisetas-hombre', 'camisetas-mujer'));

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'trusas')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'trusos-hombre');

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'shorts')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('shorts-hombre', 'shorts-mujer'));

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sudaderas')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'sudaderas-hombre');

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'leggings')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'leggings-mujer');

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sports-bras')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'sports-bras-mujer');

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'tops')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'tops-mujer');

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'busos-compresion')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('busos-compresion-hombre', 'busos-compresion-mujer'));

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'crop-tops')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'crop-tops-mujer');

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'licras')
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('licras-hombre', 'licras-mujer'));

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'accesorios')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'accesorios-unisex');

-- 3. Fix product names: Trusos → Trusas (case-insensitive)
UPDATE products
SET name = regexp_replace(name, 'Trusos', 'Trusas', 'g')
WHERE name ~* 'trusos';

-- 4. Delete old gender-specific categories (now empty)
DELETE FROM categories
WHERE slug IN (
  'camisetas-hombre', 'camisetas-mujer',
  'trusos-hombre',
  'shorts-hombre',    'shorts-mujer',
  'sudaderas-hombre',
  'leggings-mujer',
  'sports-bras-mujer',
  'tops-mujer',
  'busos-compresion-hombre', 'busos-compresion-mujer',
  'crop-tops-mujer',
  'licras-hombre',    'licras-mujer',
  'accesorios-unisex'
);
