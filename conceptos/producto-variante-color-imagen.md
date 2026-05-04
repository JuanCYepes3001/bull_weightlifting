---
tags: [concepto, productos, variantes, ecommerce, supabase, imagen]
aliases: [product variants, variantes de producto]
date: 2026-05-03
---

# Estructura producto-variante-color-imagen en e-commerce

## Modelo correcto

Un producto tiene múltiples variantes. Una variante = combinación única de atributos (color + talla). La imagen se asocia al color, no a la variante específica (porque la misma imagen sirve para todas las tallas del mismo color).

```
products (1)
  └── product_variants (N)  → product_id + size + color + stock
  └── product_images (N)    → product_id + color + url
```

## Error común: producto por color

❌ **Incorrecto:** crear un producto separado por cada color.
- "Camisa Negra" = producto 1
- "Camisa Blanca" = producto 2
- "Camisa Roja" = producto 3

Esto rompe el UX: el usuario no puede comparar colores en la misma página, el carrito se confunde, y el admin gestiona 3× más productos de los necesarios.

✅ **Correcto:** un producto, colores como variantes.
- "Camisa Cuello Redondo" = 1 producto
- Variantes: NEGRO/XS, NEGRO/S, ..., BLANCO/XS, BLANCO/S, ...
- Imágenes: 1 por color con `color = 'NEGRO'`, `color = 'BLANCO'`, etc.

## Esquema de tablas relevante

```sql
-- Una fila por combinación producto+talla+color
CREATE TABLE product_variants (
  product_id  UUID REFERENCES products(id),
  size        TEXT,     -- 'XS', 'S', 'M', ...
  color       TEXT,     -- 'NEGRO', 'BLANCO', ...
  color_hex   TEXT,     -- '#000000'
  stock       INT,
  sku         TEXT UNIQUE,  -- '01_01_01_M'
  UNIQUE (product_id, size, color)
);

-- Imagen por color (no por variante)
-- columna color añadida en migración 017
ALTER TABLE product_images ADD COLUMN color TEXT;
```

## Consulta de imagen según color seleccionado

```ts
// En el detalle del producto, al cambiar color:
const image = productImages.find(img => img.color === selectedColor);
```

O en SQL:
```sql
SELECT url FROM product_images
WHERE product_id = $1 AND color = $2
ORDER BY position LIMIT 1;
```

## Swap de imagen en el frontend (pendiente)

Cuando el usuario selecciona un color en el detalle del producto:
1. Cargar todas las imágenes del producto al montar el componente
2. Guardar en un `Map<color, url>`
3. Al cambiar color → actualizar `src` de la imagen mostrada

```tsx
const imageByColor = new Map(
  productImages.map(img => [img.color, img.url])
);

// Al seleccionar:
setCurrentImage(imageByColor.get(selectedColor) ?? defaultImage);
```

## Relacionados

- [[conceptos/importacion-excel-supabase]] — cómo importar variantes desde un Excel
- [[conceptos/operacion-atomica-sql]] — transacciones al insertar productos + variantes
- [[conceptos/supabase-realtime]] — sincronización de stock en tiempo real
