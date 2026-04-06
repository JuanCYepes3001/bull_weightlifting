-- ============================================================
-- Bull Weightlifting — Seed Data (dev/staging only)
-- Migration: 005_seed_data.sql
-- ============================================================

-- ─── Categories ───────────────────────────────────────────
INSERT INTO categories (name, slug, gender, position) VALUES
  ('Camisetas',       'camisetas-hombre',       'hombre',  1),
  ('Shorts',          'shorts-hombre',           'hombre',  2),
  ('Sudaderas',       'sudaderas-hombre',        'hombre',  3),
  ('Leggings',        'leggings-mujer',          'mujer',   1),
  ('Sports Bras',     'sports-bras-mujer',       'mujer',   2),
  ('Camisetas Mujer', 'camisetas-mujer',         'mujer',   3),
  ('Accesorios',      'accesorios-unisex',       'unisex',  1)
ON CONFLICT (slug) DO NOTHING;
