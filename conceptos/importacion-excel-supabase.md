---
tags: [concepto, importacion, excel, supabase, sql, exceljs]
aliases: [import excel, bulk import]
date: 2026-05-03
---

# Importación de Excel a Supabase vía script Node.js

## Qué es

Patrón para transformar un archivo Excel de inventario en sentencias SQL (`INSERT`) listas para ejecutar en Supabase SQL Editor. Evita la entrada manual de datos y es reproducible.

## Herramienta

`exceljs` — alternativa segura a `xlsx` (que tiene vulnerabilidades conocidas de DoS).

```bash
node scripts/import-inventory.mjs inventario.xlsx
# → genera scripts/inventory-import.sql
```

## Flujo completo

```
Excel → script Node (exceljs) → SQL → Supabase SQL Editor → BD
```

## Error FK por UUID hardcodeado

**Problema:** el script genera un UUID para cada categoría. Si esa categoría ya existe en la BD con otro UUID, el `ON CONFLICT DO UPDATE` actualiza el nombre pero no el ID. Los productos referencian el UUID del script → violación de FK.

**Solución:** usar subquery por slug en lugar de UUID:

```sql
-- ❌ MAL — UUID puede no existir en la BD
INSERT INTO products (..., category_id, ...)
VALUES (..., '41f11dbc-d0a3-...', ...);

-- ✅ BIEN — busca el id real por slug
INSERT INTO products (..., category_id, ...)
VALUES (..., (SELECT id FROM categories WHERE slug = 'shorts'), ...);
```

## Agrupación correcta: ITEM → producto, DESCRIPTION → color

Si el Excel tiene una fila por color, **no** crear un producto por fila. Agrupar:

```
CAMISA CUELLO REDONDO | NEGRO  | ... → producto + variante NEGRO
CAMISA CUELLO REDONDO | BLANCO | ... → misma producto + variante BLANCO
CAMISA CUELLO REDONDO | ROJO   | ... → misma producto + variante ROJO
```

Un solo producto con 3 variantes de color (cada una con sus tallas y stock).

## SKU system

```
{cat_code}_{product_code}_{color_code}_{talla}
01_01_01_M  →  categoría 01, producto 01, color 01, talla M
```

Estructura jerárquica que permite filtrar por cualquier nivel.

## Imágenes por color

Para que el frontend muestre la imagen correcta según el color seleccionado, asociar cada imagen con su color:

```sql
INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('...', 'https://.../CAMISA NEGRO.jpg', 'Camisa Negra', 'NEGRO', 0);
```

Los archivos en el bucket deben llamarse `"ITEM COLOR.jpg"`:
→ `CAMISA CUELLO REDONDO NEGRO.jpg`

## Relacionados

- [[conceptos/producto-variante-color-imagen]] — estructura de datos correcta para variantes
- [[conceptos/operacion-atomica-sql]] — por qué el import va dentro de BEGIN/COMMIT
- [[conceptos/supabase-admin-client-rls]] — service role para operaciones de importación
