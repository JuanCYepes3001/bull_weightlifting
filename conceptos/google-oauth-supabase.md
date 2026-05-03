---
tags: [concepto, auth, oauth, google, supabase, nextjs]
date: 2026-04-17
aliases: ["Google OAuth", "OAuth con Supabase"]
---

# Google OAuth con Supabase

## Qué es

OAuth es un protocolo que permite a un proveedor externo (Google, GitHub, etc.) autenticar al usuario sin que la app maneje contraseñas. Supabase lo integra de forma nativa: crea el usuario en `auth.users` y dispara los triggers de la DB igual que un registro normal.

## Cómo funciona el flujo completo

```
Usuario hace clic "Continuar con Google"
        ↓
supabase.auth.signInWithOAuth({ provider: "google", redirectTo: "/api/auth/callback" })
        ↓
Supabase redirige a Google (pantalla de selección de cuenta)
        ↓
Google redirige de vuelta a Supabase con código
        ↓
Supabase redirige a /api/auth/callback?code=xxx
        ↓
exchangeCodeForSession(code) → sesión activa
        ↓
Callback verifica si es usuario nuevo → redirige a /profile/account?welcome=1
```

## Ejemplo práctico (Bull Weightlifting)

**Cliente (RegisterForm.tsx):**
```tsx
const handleGoogleRegister = () => {
  startOAuthTransition(async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  });
};
```

**Callback (route.ts):**
```ts
const { data, error } = await supabase.auth.exchangeCodeForSession(code);
if (!error && data.session) {
  const provider = data.session.user.app_metadata?.provider;
  if (provider && provider !== "email") {
    // Sincronizar nombre de Google al perfil
    const name = data.session.user.user_metadata?.full_name ?? null;
    await adminClient.from("profiles").upsert({ user_id, name }, { onConflict: "user_id" });
    // Redirigir nuevos usuarios a completar su perfil
    const { data: profile } = await adminClient.from("profiles").select("addresses").eq("user_id", user.id).single();
    if ((profile?.addresses as [])?.length === 0) {
      return NextResponse.redirect(`${origin}/profile/account?welcome=1`);
    }
  }
}
```

## Datos que Google provee en `user_metadata`

| Campo | Contenido |
|---|---|
| `full_name` | Nombre completo (ej: "Juan García") |
| `name` | Igual que `full_name` |
| `avatar_url` | URL de la foto de perfil |
| `email` | Email verificado |

## Configuración requerida en Supabase Dashboard

1. **Auth → Providers → Google** → habilitar + Client ID + Client Secret
2. **Auth → URL Configuration → Site URL** = dominio de producción
3. **Redirect URLs** += `https://tudominio.com/api/auth/callback`

## Google Cloud Console (para obtener Client ID/Secret)

1. Crear proyecto → APIs & Services → Credentials → OAuth 2.0 Client ID
2. Authorized redirect URIs → pegar la **Callback URL** de Supabase (formato: `https://xxx.supabase.co/auth/v1/callback`)

## Diferencia entre email y OAuth en el trigger

- **Email/password**: `raw_user_meta_data->>'name'` viene del campo `data.name` en `signUp()`
- **Google OAuth**: `raw_user_meta_data->>'full_name'` viene directamente de Google

Por eso el trigger debe leer ambos:
```sql
COALESCE(
  NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
  NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
  NULL
)
```

## Conceptos relacionados

- [[conceptos/supabase-trigger-profile-sync]] — cómo el trigger crea el perfil automáticamente
- [[conceptos/supabase-admin-client-rls]] — por qué se usa el admin client en el callback
- [[conceptos/server-action-redirect]] — patrón de redirect en Server Actions
- [[conceptos/open-redirect]] — por qué validamos el parámetro `next` en el callback
