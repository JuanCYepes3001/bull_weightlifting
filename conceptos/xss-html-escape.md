---
tags: [seguridad, xss, html, email, sanitización]
created: 2026-04-16
aliases: [XSS, Cross-Site Scripting, HTML Escaping]
---

# XSS y Escape de HTML

## Qué es

XSS (Cross-Site Scripting) ocurre cuando datos del usuario se insertan directamente en HTML sin sanitizar, permitiendo ejecutar JavaScript malicioso.

## El problema en emails

Aunque XSS en emails tiene menos impacto que en navegadores, un atacante puede inyectar HTML para manipular el contenido del email y hacer phishing.

```typescript
// ❌ Vulnerable — nombre del usuario se inserta sin escape
`<div>${shipping.full_name}</div>`
// Si full_name = '<img src=x onerror=alert(1)>'
// El email renderiza esa etiqueta

// ✅ Seguro — caracteres especiales se neutralizan
`<div>${esc(shipping.full_name)}</div>`
```

## La función esc()

```typescript
function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
```

Convierte `<script>` en `&lt;script&gt;` — el navegador/cliente de email lo muestra como texto, no lo ejecuta.

## Regla práctica

Cualquier campo que viene del usuario (nombre, dirección, ciudad) que se inserte en un string HTML debe pasar por `esc()`. Los números y fechas calculados en el servidor no necesitan escape.

## Aplicado en este proyecto

`src/lib/email.ts` — `productName`, `size`, `color`, `full_name`, `address`, `city`, `state` todos pasan por `esc()` antes de insertarse en el template HTML.

## Conceptos relacionados

- [[prototype-pollution]] — otro vector de inyección de datos maliciosos
- [[server-side-price-validation]] — validar datos del cliente en el servidor
- [[rate-limiting]] — limitar ataques de fuerza bruta
