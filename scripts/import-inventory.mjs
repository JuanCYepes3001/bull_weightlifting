/**
 * Bull Weightlifting — Import de Inventario (v3)
 *
 * Estructura del Excel:
 *   ITEM | DESCRIPTION | QUANTITY | XS | S | M | L | XL | XXL | UNIT COST | CATEGORY_GENDER | COLOR_HEX
 *
 *   - ITEM            = nombre del producto (agrupa filas del mismo producto)
 *   - DESCRIPTION     = material/tela del producto
 *   - QUANTITY        = stock total (informativo, no se usa directamente)
 *   - XS..XXL         = stock por talla
 *   - UNIT COST       = precio unitario
 *   - CATEGORY_GENDER = género de la categoría (HOMBRE / MUJER / AMBOS / UNISEX)
 *   - COLOR_HEX       = nombre del color (NEGRO, BLANCO, etc.) o valor hex (#000000)
 *
 * Uso:
 *   node scripts/import-inventory.mjs <ruta-al-excel.xlsx>
 *
 * Salida:
 *   scripts/inventory-import.sql
 */

import ExcelJS from 'exceljs';
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_PROJECT     = 'xagdkfvnyniwyykfbrke';
const SUPABASE_STORAGE_URL = `https://${SUPABASE_PROJECT}.supabase.co/storage/v1/object/public/products`;

/** Mapa nombre → hex. Usado cuando COLOR_HEX tiene un nombre de color en texto. */
const COLOR_HEX_MAP = {
  NEGRO:        '#000000',
  BLANCO:       '#FFFFFF',
  BLANCO_HUESO: '#F5F0EB',
  ROJO:         '#DC2626',
  ROJO_OSCURO:  '#991B1B',
  AZUL:         '#2563EB',
  AZUL_MARINO:  '#1E3A5F',
  AZUL_CIELO:   '#38BDF8',
  AMARILLO:     '#EAB308',
  VERDE:        '#16A34A',
  VERDE_MILITAR:'#4B5320',
  NARANJA:      '#EA580C',
  MORADO:       '#7C3AED',
  LILA:         '#C084FC',
  GRIS:         '#6B7280',
  GRIS_OSCURO:  '#374151',
  ROSADO:       '#EC4899',
  PALO_DE_ROSA: '#E8A598',
  FUCSIA:       '#D6006E',
  TERRACOTA:    '#C1614F',
  CAFE:         '#92400E',
  BEIGE:        '#D4C5A9',
  VINOTINTO:    '#6B1E1E',
};

/**
 * Nombre del archivo de imagen en el bucket products.
 * Formato: "ITEM COLOR.jpg"  →  "CAMISA CUELLO REDONDO NEGRO.jpg"
 */
function imageFilename(item, colorName) {
  return colorName ? `${item} ${colorName}.jpg` : `${item}.jpg`;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

const slugify = (text) =>
  String(text).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const esc   = (s) => String(s ?? '').replace(/'/g, "''");
const toNum = (v) => { const n = parseFloat(String(v ?? '0').replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };
const toInt = (v) => { const n = parseInt(String(v ?? '0').replace(/[^0-9]/g, ''), 10); return isNaN(n) ? 0 : n; };
const hexKey = (s) => String(s).toUpperCase().trim().replace(/\s+/g, '_');

/**
 * Extrae la primera palabra del ITEM para identificar el tipo de prenda.
 * Soporta tanto "CAMISA CLASICA" (con espacios) como "CamisaClasica" (CamelCase).
 */
function getCategoryKey(item) {
  const s = String(item).trim();
  // Si contiene espacios, tomar la primera palabra
  if (/\s/.test(s)) return s.toUpperCase().split(/\s+/)[0];
  // CamelCase → insertar espacio antes de cada mayúscula y tomar la primera palabra
  return s.replace(/([A-Z])/g, ' $1').trim().toUpperCase().split(/\s+/)[0];
}

/**
 * Normaliza el valor de la columna CATEGORY_GENDER.
 * Acepta: HOMBRE, MUJER, AMBOS, UNISEX → devuelve 'hombre' | 'mujer' | 'unisex'
 */
function normalizeGender(val) {
  const s = String(val ?? '').trim().toUpperCase();
  if (s === 'HOMBRE') return 'hombre';
  if (s === 'MUJER')  return 'mujer';
  return 'unisex'; // AMBOS, UNISEX, vacío → unisex
}

/**
 * Parsea la columna COLOR_HEX.
 * Acepta un nombre de color ("NEGRO") o un valor hex directo ("#000000").
 * Devuelve { name, hex } donde name es la etiqueta legible y hex es el código.
 */
function parseColor(val) {
  const raw = String(val ?? '').trim();
  if (!raw) return { name: '', hex: null };

  if (raw.startsWith('#')) {
    // Valor hex directo → reverse-lookup para obtener un nombre legible
    const found = Object.entries(COLOR_HEX_MAP)
      .find(([, v]) => v.toUpperCase() === raw.toUpperCase());
    return { name: found ? found[0] : raw, hex: raw.toUpperCase() };
  }

  // Nombre de color en texto
  const key = hexKey(raw);
  return { name: raw, hex: COLOR_HEX_MAP[key] ?? null };
}

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA DEL EXCEL
// ─────────────────────────────────────────────────────────────────────────────

const excelPath = process.argv[2];
if (!excelPath) {
  console.error('\n❌  Falta el archivo Excel.\n   Uso: node scripts/import-inventory.mjs <archivo.xlsx>\n');
  process.exit(1);
}

console.log(`\n📂  Leyendo: ${resolve(excelPath)}\n`);

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(resolve(excelPath));
const sheet = workbook.worksheets[0];

// Leer cabeceras de la fila 1
const rawHeaders = [];
sheet.getRow(1).eachCell(cell => rawHeaders.push(String(cell.value ?? '').trim().toUpperCase()));
console.log(`   Columnas detectadas: ${rawHeaders.join(' | ')}`);

// Validar columnas requeridas
const REQUIRED = ['ITEM', 'DESCRIPTION', 'UNIT COST', 'CATEGORY_GENDER', 'COLOR_HEX'];
const missing = REQUIRED.filter(col => !rawHeaders.includes(col));
if (missing.length) {
  console.error(`\n❌  Columnas faltantes en el Excel: ${missing.join(', ')}`);
  console.error(`   Columnas encontradas: ${rawHeaders.join(', ')}\n`);
  process.exit(1);
}

const dataRows = [];
sheet.eachRow((row, rowNum) => {
  if (rowNum === 1) return;
  const obj = {};
  row.eachCell((cell, colNum) => {
    const h = rawHeaders[colNum - 1];
    if (h) obj[h] = cell.value;
  });
  if (obj['ITEM']) dataRows.push(obj);
});

console.log(`   Filas de datos: ${dataRows.length}\n`);

// ─────────────────────────────────────────────────────────────────────────────
// PASO 1 — CATEGORÍAS
// La clave de categoría viene de la primera palabra del ITEM.
// El género viene de la columna CATEGORY_GENDER de la primera fila de ese ITEM.
// ─────────────────────────────────────────────────────────────────────────────

const categories  = new Map(); // catKey → { id, code, name, slug, gender }
let   catCounter  = 1;

for (const row of dataRows) {
  const catKey = getCategoryKey(row['ITEM']);
  if (!categories.has(catKey)) {
    const gender  = normalizeGender(row['CATEGORY_GENDER']);
    const code    = String(catCounter++).padStart(2, '0');
    const nameCap = catKey.charAt(0) + catKey.slice(1).toLowerCase() + 's';
    categories.set(catKey, {
      id:     randomUUID(),
      code,
      name:   nameCap,
      slug:   slugify(nameCap),
      gender,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 2 — AGRUPAR POR ITEM → UN PRODUCTO, VARIOS COLORES
//
// productMap: itemName → { id, code, name, slug, description, price, catKey, colors[] }
// colors[]:  { name, hex, colorCode, variants[], imageUrl }
// variants[]: { size, stock, sku }
// ─────────────────────────────────────────────────────────────────────────────

const productMap      = new Map();
const productCounters = new Map(); // catKey → correlativo
const usedSlugs       = new Set();

for (const row of dataRows) {
  const item        = String(row['ITEM']        ?? '').trim();
  const description = String(row['DESCRIPTION'] ?? '').trim(); // material
  const price       = toNum(row['UNIT COST']);
  const catKey      = getCategoryKey(item);
  const cat         = categories.get(catKey);
  const { name: colorName, hex: colorHex } = parseColor(row['COLOR_HEX']);

  // ── Crear producto si no existe ──────────────────────────────────────────
  if (!productMap.has(item)) {
    if (!productCounters.has(catKey)) productCounters.set(catKey, 1);
    const pNum = productCounters.get(catKey);
    productCounters.set(catKey, pNum + 1);
    const pCode = String(pNum).padStart(2, '0');

    let baseSlug  = slugify(item);
    let finalSlug = baseSlug;
    let attempt   = 2;
    while (usedSlugs.has(finalSlug)) finalSlug = `${baseSlug}-${attempt++}`;
    usedSlugs.add(finalSlug);

    productMap.set(item, {
      id:          randomUUID(),
      code:        `${cat.code}_${pCode}`,  // e.g. "01_01"
      name:        item,
      slug:        finalSlug,
      description,                           // material de la primera fila
      price,
      catKey,
      cat,
      colors:      [],
    });
  }

  // Si hay varias filas del mismo ITEM con diferente precio tomamos el máximo
  const product = productMap.get(item);
  if (price > product.price) product.price = price;

  // ── Agregar color ────────────────────────────────────────────────────────
  if (!colorName) {
    console.warn(`⚠️  Fila sin color (COLOR_HEX vacío) para "${item}" — se omite`);
    continue;
  }

  const colorCode = String(product.colors.length + 1).padStart(2, '0');

  // Variantes: una por talla con stock > 0
  // SKU = {productCode}_{colorCode}_{talla}  →  e.g. "01_01_01_M"
  const variants = SIZES
    .map(size => ({ size, stock: toInt(row[size]) }))
    .filter(v => v.stock > 0)
    .map(v => ({
      size:  v.size,
      stock: v.stock,
      sku:   `${product.code}_${colorCode}_${v.size}`,
    }));

  product.colors.push({
    name:     colorName,
    hex:      colorHex,
    colorCode,
    variants,
    imageUrl: `${SUPABASE_STORAGE_URL}/${encodeURIComponent(imageFilename(item, colorName))}`,
  });
}

const products      = [...productMap.values()];
const totalVariants = products.reduce((s, p) => s + p.colors.reduce((cs, c) => cs + c.variants.length, 0), 0);
const totalImages   = products.reduce((s, p) => s + p.colors.length, 0);

// ─────────────────────────────────────────────────────────────────────────────
// PASO 3 — GENERAR SQL
// ─────────────────────────────────────────────────────────────────────────────

let sql = `-- ============================================================
-- Bull Weightlifting — Importación de Inventario v3
-- Generado: ${new Date().toISOString()}
--
-- Categorías : ${categories.size}
-- Productos  : ${products.length}
-- Colores    : ${totalImages}
-- Variantes  : ${totalVariants}
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

`;

// Categorías
sql += `\n-- ─── Categorías ────────────────────────────────────────────────\n`;
for (const [, cat] of categories) {
  sql += `INSERT INTO categories (id, name, slug, gender, position)
VALUES ('${cat.id}', '${esc(cat.name)}', '${cat.slug}', '${cat.gender}', 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, gender = EXCLUDED.gender;\n\n`;
}

// Productos
sql += `\n-- ─── Productos (1 por tipo de prenda) ──────────────────────────\n`;
for (const p of products) {
  sql += `INSERT INTO products (id, name, slug, description, price, category_id, gender, is_active)
VALUES (
  '${p.id}',
  '${esc(p.name)}',
  '${p.slug}',
  '${esc(p.description)}',
  ${p.price.toFixed(2)},
  (SELECT id FROM categories WHERE slug = '${p.cat.slug}'),
  '${p.cat.gender}',
  true
) ON CONFLICT (slug) DO NOTHING;\n\n`;
}

// Variantes (producto × color × talla)
sql += `\n-- ─── Variantes (producto × color × talla) ──────────────────────\n`;
for (const p of products) {
  sql += `-- ${p.name}  (${p.colors.length} colores, ${p.colors.reduce((s, c) => s + c.variants.length, 0)} variantes)\n`;
  for (const c of p.colors) {
    if (c.variants.length === 0) {
      sql += `  -- ⚠️  ${c.name}: sin stock en ninguna talla, se omite\n`;
      continue;
    }
    sql += `  -- Color: ${c.name}${c.hex ? ` (${c.hex})` : ''}  SKU base: ${p.code}_${c.colorCode}\n`;
    for (const v of c.variants) {
      sql += `INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku)
VALUES ('${p.id}', '${v.size}', '${esc(c.name)}', ${c.hex ? `'${c.hex}'` : 'NULL'}, ${v.stock}, '${v.sku}')
ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, color_hex = EXCLUDED.color_hex;\n`;
    }
  }
  sql += '\n';
}

// Imágenes (una por color)
sql += `\n-- ─── Imágenes (una por color) ──────────────────────────────────\n`;
sql += `-- Nombre en bucket: "ITEM COLOR.jpg"  ej: "CAMISA CUELLO REDONDO NEGRO.jpg"\n`;
for (const p of products) {
  let pos = 0;
  for (const c of p.colors) {
    sql += `INSERT INTO product_images (product_id, url, alt, color, position)
VALUES ('${p.id}', '${c.imageUrl}', '${esc(`${p.name} ${c.name}`)}', '${esc(c.name)}', ${pos++});\n`;
  }
  sql += '\n';
}

sql += `COMMIT;\n`;

// ─────────────────────────────────────────────────────────────────────────────
// ESCRIBIR SALIDA
// ─────────────────────────────────────────────────────────────────────────────

const __dirname  = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, 'inventory-import.sql');
writeFileSync(outputPath, sql, 'utf8');

console.log(`✅  SQL generado: scripts/inventory-import.sql`);
console.log(`\n   Categorías (${categories.size}):`);
for (const [key, cat] of categories) {
  console.log(`     [${cat.code}] ${key}  slug:"${cat.slug}"  género:${cat.gender}`);
}
console.log(`\n   Productos (${products.length}):`);
for (const p of products) {
  console.log(`     [${p.code}] ${p.name}`);
  for (const c of p.colors) {
    const sizes = c.variants.map(v => `${v.size}(${v.stock})`).join(' ');
    console.log(`          ${c.name.padEnd(18)} ${c.hex ?? 'sin hex'}  →  ${sizes || 'sin stock'}`);
  }
}
console.log(`\n   Total variantes : ${totalVariants}`);
console.log(`   Total imágenes  : ${totalImages}`);

// Advertir colores sin hex
const noHex = [...new Set(
  products.flatMap(p => p.colors.filter(c => !c.hex).map(c => c.name))
)];
if (noHex.length) {
  console.log(`\n⚠️  Colores sin hex (quedan NULL en BD):`);
  noHex.forEach(c => console.log(`     "${c}"  →  agrega COLOR_HEX_MAP['${hexKey(c)}'] = '#xxxxxx' en el script`));
}

console.log(`\n📋  Pasos siguientes:`);
console.log(`   1. Renombra las fotos en el bucket: "ITEM COLOR.jpg"`);
console.log(`      Ejemplo: "CAMISA CUELLO REDONDO NEGRO.jpg"`);
console.log(`   2. Ejecuta scripts/inventory-import.sql en Supabase SQL Editor\n`);
