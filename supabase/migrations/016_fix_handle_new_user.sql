-- ============================================================
-- Fix handle_new_user: read both 'name' and 'full_name' from
-- metadata (Google OAuth uses full_name, email signup uses name).
-- Also switch ON CONFLICT to DO UPDATE so re-registrations and
-- OAuth users always get their name synced.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
BEGIN
  v_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    NULL
  );

  INSERT INTO public.profiles (user_id, name, role)
  VALUES (NEW.id, v_name, 'user')
  ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
