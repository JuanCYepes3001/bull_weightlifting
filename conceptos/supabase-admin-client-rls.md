---
tags: [concepto, supabase, rls, seguridad, server-action]
date: 2026-04-17
aliases: ["admin client", "service role", "bypass RLS"]
---

# Supabase Admin Client — Bypass de RLS con Service Role

## Qué es

Supabase tiene dos tipos de cliente:

| Cliente | Key | RLS | Cuándo usar |
|---|---|---|---|
| Regular (`anon` / `user`) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Aplicada | Código del usuario, frontend, Server Actions normales |
| Admin (`service_role`) | `SUPABASE_SERVICE_ROLE_KEY` | **Ignorada** | Operaciones privilegiadas en el servidor que necesitan saltar las políticas |

## Por qué existe el problema con RLS en el registro

Cuando un usuario se registra con confirmación de email activada:
1. Se crea en `auth.users` ✓
2. No tiene sesión activa todavía (email sin confirmar)
3. Si intentas leer/escribir su perfil con el cliente regular → **RLS bloquea** porque no hay JWT válido

Por eso el trigger de la DB crea el perfil (la DB tiene acceso directo), y `registerAction` usa el admin client para el upsert con los campos extra (teléfono, dirección).

## Implementación

```ts
// src/lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,  // ← service role, no anon key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

```ts
// Uso en registerAction (src/app/actions/auth.ts)
const adminClient = createAdminClient();
const { error: upsertError } = await adminClient
  .from("profiles")
  .upsert({ user_id: signUpData.user.id, ...updates }, { onConflict: "user_id" });

if (upsertError) {
  console.error("[registerAction] profile upsert failed:", upsertError.message);
}
```

## Regla de oro: NUNCA exponer el admin client al browser

`SUPABASE_SERVICE_ROLE_KEY` (sin `NEXT_PUBLIC_`) solo existe en el servidor. Si se filtra, cualquiera puede leer/escribir cualquier dato de la DB sin restricciones.

Usos válidos (solo en Server Actions, API Routes, triggers):
- Crear/actualizar perfiles durante el registro (sin sesión activa)
- Eliminar cuentas de usuario (`deleteAccountAction`)
- Operaciones admin que necesitan ver datos de todos los usuarios
- Callback OAuth para sincronizar perfil

## Ejemplo de dónde se usa en el proyecto

| Acción | Por qué necesita admin |
|---|---|
| `registerAction` — upsert perfil | Usuario sin sesión (email no confirmado) |
| `deleteAccountAction` — `auth.admin.deleteUser()` | Solo el service role puede eliminar usuarios de `auth.users` |
| `callback/route.ts` — upsert nombre OAuth | El callback corre antes de que la sesión esté completamente establecida |
| Varias acciones admin — `listUsers`, stats | Necesitan ver datos de todos los usuarios, RLS normalmente restringe |

## Conceptos relacionados

- [[conceptos/supabase-trigger-profile-sync]] — el trigger que trabaja en paralelo
- [[conceptos/google-oauth-supabase]] — caso concreto del callback OAuth
- [[conceptos/variables-entorno-seguridad]] — por qué la key no lleva `NEXT_PUBLIC_`
- [[conceptos/server-action-redirect]] — contexto de ejecución de Server Actions
