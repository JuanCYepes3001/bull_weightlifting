---
tags: [concepto, seguridad, auth, nextjs, CWE-601]
created: 2026-04-16
aliases: [redirección abierta, open redirect, CWE-601]
---

# Open Redirect

Un **open redirect** ocurre cuando un servidor redirige al usuario a una URL controlada por el atacante. Se usa en campañas de phishing: el enlace parece legítimo (viene de tu dominio) pero lleva a un sitio malicioso.

El patrón más común es un parámetro `?next=` o `?redirect=` en el login que no es validado.

---

## El problema

```typescript
// ❌ VULNERABLE — src/app/api/auth/callback/route.ts
const next = searchParams.get("next") ?? "/";
return NextResponse.redirect(`${origin}${next}`);
```

Si `next` es `//evil.com`, la URL resultante es `https://myapp.com//evil.com` que el browser interpreta como `https://evil.com`. El usuario completó el login exitosamente y es redirigido al sitio del atacante.

**Flujo del ataque:**
1. Atacante envía un email con el link: `https://bull.com/api/auth/callback?code=...&next=//phishing.com/fake-login`
2. El link parece legítimo (dominio real, incluso el código de auth es válido si usaron magic link)
3. El usuario hace clic, inicia sesión correctamente
4. El servidor redirige a `//phishing.com/fake-login`
5. El sitio falso pide "confirmar contraseña" → credenciales robadas

---

## La solución: validar que sea ruta relativa

```typescript
// ✅ SEGURO — solo se aceptan rutas relativas que empiezan con /
const next = searchParams.get("next") ?? "/";

// Acepta:  /profile, /checkout, /admin/orders
// Rechaza: //evil.com, https://evil.com, /\evil.com, javascript:alert()
const safePath = /^\/(?!\/)/.test(next) ? next : "/";

return NextResponse.redirect(`${origin}${safePath}`);
```

La regex `^\/(?!\/)` verifica que:
- Empieza con `/` (ruta relativa)
- El segundo carácter NO es `/` (descarta `//evil.com`)

---

## Otras variantes del mismo bug

```typescript
// También vulnerable — redirect en loginAction
const redirectTo = formData.get("redirect") as string;
redirect(redirectTo); // ❌ sin validar

// Fix: solo se permite si empieza con /
redirect(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/");
// Pero ojo: /\evil.com pasa este test en algunos parsers
// La regex es más robusta: /^\/(?!\/)/.test(redirectTo)
```

---

## En Bull Weightlifting

El `loginAction` en `src/app/actions/auth.ts` ya tenía la validación básica (`redirectTo.startsWith("/")`). El hallazgo CN-004 fue en `src/app/api/auth/callback/route.ts` donde el parámetro `next` se concatenaba directamente sin validar. Fix pendiente (una línea).

---

## Conceptos relacionados

- [[conceptos/middleware-vs-layout-auth]] — el middleware también puede interceptar redirects sospechosos
- [[conceptos/server-action-redirect]] — los Server Actions también usan `redirect()` — mismo principio aplica
- [[conceptos/http-security-headers]] — `form-action 'self'` en CSP es una capa de defensa adicional contra redirects via formularios
