---
tags: [concepto, nextjs, seguridad, middleware, autenticación]
created: 2026-04-14
aliases: [protección de rutas, Edge middleware, auth guard]
---

# Middleware vs Layout para protección de rutas

En Next.js App Router hay dos lugares donde se puede verificar si un usuario tiene permiso para acceder a una ruta. No son equivalentes — tienen momentos de ejecución muy distintos.

---

## El problema: poner el guard demasiado tarde

```typescript
// ❌ Layout de admin — guard tardío
export default async function AdminLayout({ children }) {
  const { profile } = await requireAdmin(); // redirige si no es admin
  return <>{children}</>;
}
```

Esto parece seguro, pero el order de ejecución es:

```
Request llega
  → Middleware (no hace nada)
  → Next.js empieza a renderizar
  → AdminLayout ejecuta requireAdmin()
  → Si falla: redirect
```

El problema: Next.js **ya inició el render** antes del redirect. Dependiendo de cómo estén estructuradas las páginas, puede haber leaks de datos o comportamientos inesperados. Y en casos de Server Actions, la protección puede no aplicarse en absoluto.

---

## La solución: el guard en el middleware

El **middleware** corre en el **Edge Runtime**, antes de que Next.js procese la request, antes de cualquier render, antes de cualquier Server Component.

```
Request llega
  → Middleware verifica rol ← aquí, en el borde
  → Si no es admin: redirect inmediato, nada más se ejecuta
  → Si es admin: la request llega al layout/page normalmente
```

```typescript
// middleware.ts (o lib/supabase/middleware.ts)
if (user && isAdmin) {
  const { data: role } = await supabase.rpc("get_user_role");
  if (role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
```

---

## Cuándo usar cada uno

| | Middleware | Layout |
|---|---|---|
| Momento | Antes de render | Durante render |
| Runtime | Edge (V8 puro) | Node.js |
| Acceso a DB compleja | Limitado (solo RPCs simples) | Completo |
| Protección de datos | ✅ Más seguro | ⚠️ Puede haber leaks |
| Redirect costo | Muy bajo | Más alto |
| Uso correcto | Verificar auth y rol | Cargar datos del usuario autenticado |

---

## Patrón correcto: middleware + layout en capas

No son mutuamente excluyentes — se complementan:

```typescript
// Middleware: guard de seguridad (¿puede entrar?)
if (user && isAdmin) {
  const { data: role } = await supabase.rpc("get_user_role");
  if (role !== "admin") return NextResponse.redirect(new URL("/", request.url));
}

// Layout: cargar datos del admin (¿qué datos necesita?)
export default async function AdminLayout({ children }) {
  const { profile } = await requireAdmin();
  return <AdminShell profile={profile}>{children}</AdminShell>;
}
```

El middleware es el portero. El layout es el recepcionista que ya asume que el portero hizo su trabajo.

---

## Conceptos relacionados

- [[conceptos/server-action-redirect]] — cómo funciona redirect() en Server Actions (también es render-time, no edge)
- [[conceptos/cookie-httponly-estado-transitorio]] — cookies en el contexto de Edge middleware y redirect flows
