---
tags: [concepto, seguridad, nextjs, http, csp, hsts]
created: 2026-04-16
aliases: [security headers, cabeceras de seguridad, CSP, HSTS, X-Frame-Options]
---

# HTTP Security Headers

Los **security headers** son cabeceras HTTP que el servidor envía para instruir al navegador sobre políticas de seguridad. Son una capa de defensa pasiva: no previenen que el código sea vulnerable, pero reducen el impacto si lo es.

En Next.js se configuran en la función `headers()` de `next.config.ts` y aplican a todas las respuestas.

---

## Los 6 headers esenciales

### 1. Content-Security-Policy (CSP)

Le dice al navegador qué orígenes puede cargar para cada tipo de recurso. Si hay un XSS, el browser bloquea la ejecución de scripts no autorizados.

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.paypal.com;
  img-src 'self' data: https://*.supabase.co;
  connect-src 'self' https://*.supabase.co https://api.paypal.com;
  frame-ancestors 'none';
```

- `default-src 'self'` — solo recursos del mismo origen por defecto
- `frame-ancestors 'none'` — nadie puede embeber la app en un iframe (anti-clickjacking)
- `'unsafe-inline'` en `script-src` — necesario para Next.js App Router (hidratación de React)

### 2. Strict-Transport-Security (HSTS)

Fuerza que el navegador use HTTPS en futuras visitas, incluso si el usuario escribe `http://`.

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

- `max-age=63072000` — 2 años
- `preload` — permite incluir el dominio en la lista HSTS preload del navegador

⚠️ Solo funciona en producción con HTTPS. No activar en desarrollo local.

### 3. X-Frame-Options

Impide que la página sea cargada en un `<iframe>` — previene **clickjacking** (superponer un iframe invisible sobre un botón legítimo).

```
X-Frame-Options: DENY
```

Equivalente moderno: `frame-ancestors 'none'` en la CSP (más flexible).

### 4. X-Content-Type-Options

Impide que el navegador "adivine" el tipo MIME de un recurso. Sin esto, un archivo `.txt` subido con contenido HTML podría ejecutarse como HTML.

```
X-Content-Type-Options: nosniff
```

### 5. Referrer-Policy

Controla qué información de URL se envía en el header `Referer` al navegar a otro sitio. Previene filtrado de rutas internas o tokens en URLs.

```
Referrer-Policy: strict-origin-when-cross-origin
```

Solo envía el origen (no la ruta) en requests cross-origin.

### 6. Permissions-Policy

Deshabilita APIs del navegador que la app no usa. Reduce la superficie de ataque si hay una XSS.

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Configuración en Next.js

```typescript
// next.config.ts
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.paypal.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co https://api.paypal.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: "/(.*)",   // aplica a todas las rutas
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Content-Security-Policy", value: ContentSecurityPolicy },
      ],
    }];
  },
};
```

---

## Limitación de `unsafe-inline` en CSP

Next.js App Router genera `<script>` inline para la hidratación de React. Mientras esté presente, la CSP no bloquea XSS inline completamente.

La solución es **nonce-based CSP**: el servidor genera un nonce aleatorio por request, lo inyecta en el `<script>` de Next.js y lo incluye en la CSP. Más seguro, pero requiere configuración en middleware.

---

## Verificar los headers

```bash
curl -I https://tu-dominio.com | grep -E "x-frame|x-content|csp|hsts"

# O usar: https://securityheaders.com
```

---

## Conceptos relacionados

- [[conceptos/middleware-vs-layout-auth]] — el middleware de Next.js es donde también se pueden inyectar headers por ruta
- [[conceptos/open-redirect]] — CSP `form-action 'self'` ayuda a mitigar redirects maliciosos
