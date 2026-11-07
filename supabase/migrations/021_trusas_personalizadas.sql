-- ============================================================
-- Migration: 021_trusas_personalizadas.sql
--
-- Las 3 trusas personalizadas se venden a precio fijo y se fabrican sobre
-- pedido; el diseño se acuerda por WhatsApp después del pago
-- (src/lib/customization.ts). No tenían variantes, así que no se podían
-- agregar al carrito: cada pedido necesita un product_variant.
--
-- Los nombres se guardaron sin espacios ("TrusaMangasPersonalizada").
-- Renombrar es seguro: ninguna de las 3 depende de la convención de imagen
-- "{name} {color}.<ext>" (la Clásica usa una URL explícita en
-- product_images; Mangas y Albornoz no tienen imágenes todavía).
--
-- Idempotente: se puede ejecutar más de una vez.
-- ============================================================

UPDATE products SET name = 'Trusa Clásica Personalizada'  WHERE slug = 'trusaclasicapersonalizada';
UPDATE products SET name = 'Trusa Mangas Personalizada'   WHERE slug = 'trusamangaspersonalizada';
UPDATE products SET name = 'Trusa Albornoz Personalizada' WHERE slug = 'trusaalbornozpersonalizada';

-- Una variante por talla. El color del estampado se define por WhatsApp,
-- por eso el color de la variante es "PERSONALIZADO". Stock alto: se
-- fabrican sobre pedido, no hay inventario físico que agotar.
INSERT INTO product_variants (product_id, size, color, stock)
SELECT p.id, s.size, 'PERSONALIZADO', 999
FROM products p
CROSS JOIN (VALUES ('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL')) AS s(size)
WHERE p.slug IN ('trusaclasicapersonalizada', 'trusamangaspersonalizada', 'trusaalbornozpersonalizada')
ON CONFLICT (product_id, size, color) DO NOTHING;
