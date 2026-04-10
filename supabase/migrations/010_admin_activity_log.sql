-- ============================================================
-- Bull Weightlifting — Admin Activity Log
-- Migration: 010_admin_activity_log.sql
-- Tracks all admin actions for the dashboard history feed
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_name  TEXT NOT NULL DEFAULT 'Admin',
  action      TEXT NOT NULL,        -- 'product_created', 'product_updated', 'product_deleted', 'stock_updated', 'offer_applied', 'bulk_deleted'
  entity_type TEXT NOT NULL DEFAULT 'product',
  entity_id   UUID,
  entity_name TEXT,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX idx_admin_activity_log_admin_id   ON admin_activity_log(admin_id);

-- RLS: only admins can read/write
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read activity log"
  ON admin_activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert activity log"
  ON admin_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
