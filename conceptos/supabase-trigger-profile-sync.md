---
tags: [concepto, supabase, postgresql, trigger, auth]
date: 2026-04-17
aliases: ["handle_new_user", "trigger de perfil"]
---

# Supabase Trigger — Sincronización de perfil al registrarse

## Qué es

Un trigger de PostgreSQL que se dispara automáticamente cuando Supabase inserta un nuevo usuario en `auth.users`. Su función es crear la fila correspondiente en `public.profiles` con los datos del usuario.

## Por qué es necesario

Supabase gestiona `auth.users` internamente. El código de aplicación no puede ni debe insertar filas directamente en esa tabla. Para tener datos del usuario en tablas propias (con RLS, relaciones, etc.) hay que usar un trigger.

## Implementación en Bull Weightlifting

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
BEGIN
  -- Google usa 'full_name', email/password usa 'name'
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

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## `ON CONFLICT DO NOTHING` vs `DO UPDATE`

| Estrategia | Cuándo usar |
|---|---|
| `DO NOTHING` | Si solo quieres crear el perfil una vez y nunca sobreescribir |
| `DO UPDATE SET name = COALESCE(EXCLUDED.name, profiles.name)` | Si quieres que el nombre de Google se sincronice; preserva el nombre existente si el nuevo es null |

El proyecto usa `DO UPDATE` con `COALESCE` para que:
- Si hay un conflicto y el nuevo nombre no es null → actualiza
- Si el nuevo nombre es null → conserva el que ya había

## Relación con el upsert de `registerAction`

El trigger crea el perfil con `name`. Luego `registerAction` hace un upsert adicional para guardar `phone` y `addresses`:

```
1. signUp() → trigger → INSERT profiles(user_id, name, role)
2. registerAction → adminClient.upsert({ user_id, name, phone, addresses })
   → UPDATE profiles SET name=..., phone=..., addresses=...
```

Ambos son necesarios porque el trigger no tiene acceso a los campos extra del formulario (teléfono, dirección).

## `SECURITY DEFINER`

La función corre con los permisos del usuario que la creó (normalmente `postgres`/superuser), no con los del usuario que dispara el trigger. Esto es necesario porque el trigger necesita escribir en `public.profiles` aunque el usuario aún no exista en esa tabla.

## Errores comunes

| Error | Causa | Solución |
|---|---|---|
| Perfil sin nombre (null) | El trigger leyó solo `name` y Google envía `full_name` | Leer ambos con `COALESCE` |
| Perfil no se crea | Migración no ejecutada en Supabase prod | Ejecutar SQL en Dashboard → SQL Editor |
| `ON CONFLICT DO NOTHING` olvida datos de re-registro | Trigger ignora el conflicto | Usar `DO UPDATE` con `COALESCE` |

## Conceptos relacionados

- [[conceptos/google-oauth-supabase]] — de dónde vienen `full_name` y `name`
- [[conceptos/supabase-admin-client-rls]] — por qué el upsert posterior usa admin client
- [[conceptos/supabase-realtime]] — otro patrón de Supabase que usa triggers internamente
- [[conceptos/operacion-atomica-sql]] — por qué la lógica de creación va en la DB, no en JS
