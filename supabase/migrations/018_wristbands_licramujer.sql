-- ============================================================
-- Migration: 018_wristbands_licramujer.sql
--
-- Reconciles product/category names + variant colors with the images
-- uploaded to the `products` storage bucket (product detail/catalog
-- images are resolved client-side by the naming convention
-- "{product.name} {variant.color}.<ext>" — see src/lib/storage.ts —
-- so the DB text has to match the storage filenames byte-for-byte).
--
-- NOTE: the storage object renames/recompressions (wristbands *.png ->
-- Wristbands *.jpeg — also shrunk from ~1.7MB to ~150KB, they were huge
-- uncompressed PNGs) were performed out-of-band via the Supabase Storage
-- API and are not repeated here; this file only covers table data.
-- ============================================================

-- ─── 1. Fix "Writsbandss"/"writsbands" typo ──────────────────
UPDATE categories SET name = 'Wristbands', slug = 'wristbands'
WHERE slug = 'writsbandss';

UPDATE products SET name = 'Wristbands', slug = 'wristbands'
WHERE slug = 'writsbands';

-- Bogus color that was never a real wristband color (5 colors only:
-- amarillo, azul, negro, rojo, rosado)
DELETE FROM product_variants
WHERE product_id = (SELECT id FROM products WHERE slug = 'wristbands')
  AND color = 'BLANCO';

DELETE FROM product_images
WHERE product_id = (SELECT id FROM products WHERE slug = 'wristbands');

INSERT INTO product_images (product_id, url, alt, color, position)
SELECT
  (SELECT id FROM products WHERE slug = 'wristbands'),
  'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Wristbands%20' || color || '.jpeg',
  'Wristbands ' || color,
  color,
  pos
FROM (VALUES ('AMARILLO', 0), ('AZUL', 1), ('NEGRO', 2), ('ROJO', 3), ('ROSADO', 4)) AS t(color, pos);

-- ─── 2. "Licras" category now hosts hombre + mujer products ──
UPDATE categories SET gender = 'unisex' WHERE slug = 'licras';

-- ─── 3. CamisaClasicaLogo: variant colors didn't match the ───
--        uploaded filenames (gender-agreement / naming drift)
UPDATE product_variants SET color = 'ROSADA'
WHERE product_id = (SELECT id FROM products WHERE slug = 'camisaclasicalogo') AND color = 'ROSADO';

UPDATE product_variants SET color = 'PALO_ROSA'
WHERE product_id = (SELECT id FROM products WHERE slug = 'camisaclasicalogo') AND color = 'PALO_DE_ROSA';

UPDATE product_variants SET color = 'MORADA'
WHERE product_id = (SELECT id FROM products WHERE slug = 'camisaclasicalogo') AND color = 'MORADO';

DELETE FROM product_images
WHERE product_id = (SELECT id FROM products WHERE slug = 'camisaclasicalogo');

INSERT INTO product_images (product_id, url, alt, color, position)
SELECT
  (SELECT id FROM products WHERE slug = 'camisaclasicalogo'),
  'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/CamisaClasicaLogo%20' || color || '.jpeg',
  'CamisaClasicaLogo ' || color,
  color,
  pos
FROM (VALUES
  ('ROJO', 0), ('NEGRO', 1), ('AMARILLO', 2), ('VERDE_MILITAR', 3), ('AZUL_MARINO', 4),
  ('ROSADA', 5), ('PALO_ROSA', 6), ('MORADA', 7), ('LILA', 8), ('TERRACOTA', 9), ('FUCSIA', 10)
) AS t(color, pos);

-- ─── 4. LicraLarga (licra hombre): single design, front/back ─
--        gallery instead of per-color images
DELETE FROM product_images
WHERE product_id = (SELECT id FROM products WHERE slug = 'licralarga');

INSERT INTO product_images (product_id, url, alt, color, position) VALUES
  ((SELECT id FROM products WHERE slug = 'licralarga'), 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Licra_hombre.jpeg',  'LicraLarga NEGRO - frente',  'NEGRO', 0),
  ((SELECT id FROM products WHERE slug = 'licralarga'), 'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/Licra_hombre2.jpeg', 'LicraLarga NEGRO - espalda', 'NEGRO', 1);

-- ─── 5. New product: LicraMujer ───────────────────────────────
INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
SELECT uuid_generate_v4(), 'LicraMujer', 'licramujer', 'Spandex algodon', 110000,
       (SELECT id FROM categories WHERE slug = 'licras'), 'mujer', TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'licramujer');

INSERT INTO product_variants (product_id, size, color, color_hex, stock)
SELECT (SELECT id FROM products WHERE slug = 'licramujer'), size, color, hex, 0
FROM (VALUES
  ('NEGRA', '#000000'), ('AMARILLA', '#EAB308'), ('AZUL_MARINO', '#1E3A5F'),
  ('ROSADA', '#EC4899'), ('VERDE_MILITAR', '#4B5320')
) AS c(color, hex)
CROSS JOIN (VALUES ('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL')) AS s(size)
WHERE NOT EXISTS (
  SELECT 1 FROM product_variants v
  WHERE v.product_id = (SELECT id FROM products WHERE slug = 'licramujer') AND v.color = c.color AND v.size = s.size
);

-- Catalog-only shot (no color) first, then per-color images for the detail gallery
INSERT INTO product_images (product_id, url, alt, color, position)
SELECT (SELECT id FROM products WHERE slug = 'licramujer'),
       'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/LicraMujer.jpeg', 'LicraMujer', NULL, 0
WHERE NOT EXISTS (
  SELECT 1 FROM product_images pi
  WHERE pi.product_id = (SELECT id FROM products WHERE slug = 'licramujer') AND pi.position = 0
);

INSERT INTO product_images (product_id, url, alt, color, position)
SELECT
  (SELECT id FROM products WHERE slug = 'licramujer'),
  'https://xagdkfvnyniwyykfbrke.supabase.co/storage/v1/object/public/products/LicraMujer%20' || color || '.jpeg',
  'LicraMujer ' || color,
  color,
  pos
FROM (VALUES ('NEGRA', 1), ('AMARILLA', 2), ('AZUL_MARINO', 3), ('ROSADA', 4), ('VERDE_MILITAR', 5)) AS t(color, pos)
WHERE NOT EXISTS (
  SELECT 1 FROM product_images pi
  WHERE pi.product_id = (SELECT id FROM products WHERE slug = 'licramujer') AND pi.color = t.color
);
