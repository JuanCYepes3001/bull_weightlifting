---
tags: [seguridad, env-vars, next-js, configuración]
created: 2026-04-16
aliases: [NEXT_PUBLIC_, variables de entorno, env vars]
---

# Seguridad en Variables de Entorno (Next.js)

## El problema con NEXT_PUBLIC_

En Next.js, cualquier variable que empiece con `NEXT_PUBLIC_` se **embebe en el bundle del cliente** — es decir, cualquier usuario que inspeccione el JS descargado puede verla.

```
NEXT_PUBLIC_SUPABASE_URL    → visible en el navegador ✅ (es intencional, es pública)
NEXT_PUBLIC_SITE_URL        → visible en el navegador ⚠️ (innecesario)
SUPABASE_SERVICE_ROLE_KEY   → solo en el servidor ✅ (correcto)
```

## Regla

Solo usar `NEXT_PUBLIC_` cuando el valor **necesita** estar en el cliente (componentes React, hooks). Si la variable solo se usa en Server Actions, API routes o middleware → sin prefijo.

## Caso concreto resuelto

`NEXT_PUBLIC_SITE_URL` se usaba únicamente dentro de Server Actions para construir URLs de redirect de email. Se renombró a `SITE_URL`:

```typescript
// auth.ts (Server Action) — no necesita ser pública
emailRedirectTo: `${process.env.SITE_URL}/api/auth/callback`

// checkout.ts (Server Action) — no necesita ser pública
const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
```

## El riesgo del fallback localhost

```typescript
// ❌ Silencia el error en producción
const url = process.env.SITE_URL ?? "http://localhost:3000";
// Si la var no está en Vercel, los emails de verificación
// apuntan a localhost — no funcionan y nadie se entera

// ✅ Mejor: documentar el requisito explícitamente
// y monitorear errores en logs
```

## Variables por categoría en este proyecto

| Variable | Tipo | Por qué |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | pública | usada en cliente para queries |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | pública | usada en cliente para auth |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | acceso total a DB — nunca al cliente |
| `SITE_URL` | server-only | solo en Server Actions |
| `RESEND_API_KEY` | server-only | credencial de API |
| `TWILIO_AUTH_TOKEN` | server-only | credencial de API |

## Conceptos relacionados

- [[http-security-headers]] — otra capa de protección del lado servidor
- [[rate-limiting]] — protección de endpoints
- [[open-redirect]] — mal uso de URLs en el servidor
