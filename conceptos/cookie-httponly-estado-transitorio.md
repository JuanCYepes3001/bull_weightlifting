---
tags: [concepto, cookies, seguridad, estado, nextjs]
created: 2026-04-12
aliases: [cookie de estado, estado entre redirects, cookie httpOnly]
---

# Cookie httpOnly para estado transitorio

Técnica para preservar datos entre una redirección a un servicio externo y el regreso al sitio. Útil cuando el usuario abandona temporalmente la sesión del navegador (ej: ir a PayPal y volver).

## El problema

En un flujo de pago con redirección:

```
Tu sitio → [datos del formulario en memoria] → PayPal → Tu sitio
                     ↑
              Se pierden aquí
```

El estado de React (items del carrito, dirección de envío) vive en memoria. Al navegar fuera del sitio, ese estado desaparece.

## La solución

Antes de redirigir, guardar los datos en una cookie httpOnly en el servidor. Al volver, leer la cookie desde el servidor.

```typescript
// Server Action — antes de redirigir a PayPal
import { cookies } from "next/headers";

export async function createPayPalOrderAction(items, shipping) {
  const { approvalUrl } = await createPayPalOrder(total, ...);

  // Guardar datos en cookie httpOnly de corta duración
  const jar = await cookies();
  jar.set("paypal_pending", JSON.stringify({ items, shipping }), {
    maxAge: 60 * 15,  // 15 minutos
    httpOnly: true,   // no accesible desde JS del cliente
    sameSite: "lax",  // se envía en redirects del mismo sitio
    path: "/",
  });

  return { approvalUrl };
}

// Page de retorno — leer la cookie
export async function finalizePayPalOrderAction(paypalToken) {
  const jar = await cookies();
  const raw = jar.get("paypal_pending")?.value;
  const { items, shipping } = JSON.parse(raw);

  // Capturar pago y crear orden con los datos recuperados
  await capturePayPalOrder(paypalToken);
  await insertOrder(items, shipping, ...);

  jar.delete("paypal_pending"); // limpiar
}
```

## Por qué httpOnly

- `httpOnly: true` → JavaScript del cliente no puede leer la cookie (previene XSS)
- Solo accesible desde el servidor (Server Actions, Route Handlers)
- Más seguro que `localStorage` o parámetros en la URL

## Alternativas y cuándo usarlas

| Alternativa | Cuándo usar | Problema |
|---|---|---|
| Cookie httpOnly | Redirect externo temporal | Solo para datos cortos (max ~4KB) |
| Base de datos | Flujos largos / multi-paso | Más complejidad, requiere cleanup |
| URL params | Datos mínimos y no sensibles | Visible en historial del navegador |
| sessionStorage | No redirige fuera del origen | No persiste entre páginas externas |

## Relacionado

- [[paypal-redirect-flow]] — caso de uso principal de esta técnica
- [[server-action-redirect]] — cómo funciona el redirect en Next.js Server Actions
