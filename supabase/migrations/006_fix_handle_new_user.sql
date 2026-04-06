-- ============================================================
-- Fix: handle_new_user trigger
-- El current_setting('app.admin_emails') falla si no existe
-- Simplificamos: todos los usuarios nuevos son 'user'.
-- Para promover a admin: UPDATE profiles SET role = 'admin'
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL),
    'user'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
