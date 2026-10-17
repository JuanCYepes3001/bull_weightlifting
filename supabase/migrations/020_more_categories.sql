-- ============================================================
-- Bull Weightlifting — Extended Category Catalog
-- Migration: 009_more_categories.sql
-- Based on current product catalog:
--   Camisas clasicas, Trusos (clasico/con mangas/manga siza/diseño),
--   Vendas, Muñequeras, Short Men, Short mujer, Tops mujer,
--   Buso compresion hombre/mujer, Crop top mujer compresion,
--   Licra larga hombre/mujer
-- ============================================================

INSERT INTO categories (name, slug, gender, position) VALUES
  -- HOMBRE
  ('Trusos',                 'trusos-hombre',           'hombre', 4),
  ('Busos Compresión',       'busos-compresion-hombre', 'hombre', 5),
  ('Licras Largas',          'licras-hombre',           'hombre', 6),

  -- MUJER
  ('Shorts',                 'shorts-mujer',            'mujer',  4),
  ('Tops Deportivos',        'tops-mujer',              'mujer',  5),
  ('Crop Tops Compresión',   'crop-tops-mujer',         'mujer',  6),
  ('Busos Compresión',       'busos-compresion-mujer',  'mujer',  7),
  ('Licras Largas',          'licras-mujer',            'mujer',  8)

ON CONFLICT (slug) DO NOTHING;
