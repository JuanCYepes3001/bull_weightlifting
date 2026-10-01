-- ============================================================
-- Bull Weightlifting — Legal Documents & Acceptances
-- Migration: 019_legal_documents.sql
-- Aceptación legal (términos, privacidad, etc.) con evidencia
-- de aceptación por usuario para cumplimiento antes de producción.
-- ============================================================

-- ─── Enums ────────────────────────────────────────────────
CREATE TYPE legal_document_status AS ENUM ('borrador', 'vigente', 'archivado');


-- ============================================================
-- LEGAL DOCUMENTS
-- Contenido versionado por slug (ej: 'terminos', 'privacidad').
-- Solo documentos con status 'vigente' son visibles públicamente;
-- el contenido .md real vive en el repo (guard de borrador en código,
-- frontmatter consistente con este mismo status).
-- ============================================================
CREATE TABLE legal_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL,
  version       INT NOT NULL,
  title         TEXT NOT NULL,
  status        legal_document_status NOT NULL DEFAULT 'borrador',
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT    legal_documents_slug_version_unique UNIQUE (slug, version)
);

CREATE INDEX idx_legal_documents_slug   ON legal_documents(slug);
CREATE INDEX idx_legal_documents_status ON legal_documents(status);

DROP TRIGGER IF EXISTS trg_legal_documents_updated_at ON legal_documents;
CREATE TRIGGER trg_legal_documents_updated_at
  BEFORE UPDATE ON legal_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- LEGAL ACCEPTANCES
-- Evidencia de aceptación: un registro inmutable por cada vez
-- que un usuario acepta una versión de un documento legal.
-- Sin UPDATE/DELETE vía RLS — es un log de evidencia, no editable.
-- user_id es nullable con ON DELETE SET NULL (no CASCADE): la Ley 1581
-- permite solicitar supresión de datos, pero la evidencia de aceptación
-- debe sobrevivir a esa supresión. user_email guarda una copia del email
-- al momento de aceptar para seguir identificando a quién aceptó aunque
-- el usuario ya no exista.
-- ============================================================
CREATE TABLE legal_acceptances (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email   TEXT NOT NULL,
  document_id  UUID NOT NULL REFERENCES legal_documents(id) ON DELETE RESTRICT,
  accepted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address   TEXT,
  user_agent   TEXT
);

CREATE INDEX idx_legal_acceptances_user_id     ON legal_acceptances(user_id);
CREATE INDEX idx_legal_acceptances_user_email  ON legal_acceptances(user_email);
CREATE INDEX idx_legal_acceptances_document_id ON legal_acceptances(document_id);


-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE legal_documents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_acceptances ENABLE ROW LEVEL SECURITY;

-- LEGAL DOCUMENTS — lectura pública de vigentes, admin acceso total
CREATE POLICY "legal_documents_public_read"
  ON legal_documents FOR SELECT
  USING (status = 'vigente' OR is_admin());

CREATE POLICY "legal_documents_admin_all"
  ON legal_documents FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- LEGAL ACCEPTANCES — cada usuario inserta/lee las suyas, admin lee todas
-- (user_id nullable tras supresión de cuenta: el IS NOT NULL evita que
-- una fila huérfana quede visible por una comparación implícita con NULL)
CREATE POLICY "legal_acceptances_select_own"
  ON legal_acceptances FOR SELECT
  USING ((user_id IS NOT NULL AND auth.uid() = user_id) OR is_admin());

CREATE POLICY "legal_acceptances_insert_own"
  ON legal_acceptances FOR INSERT
  WITH CHECK (auth.uid() = user_id);
