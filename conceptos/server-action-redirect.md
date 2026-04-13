---
tags: [concepto, nextjs, server-actions, redirect, navegacion]
created: 2026-04-12
aliases: [redirect en server action, redirect Next.js, server action navigation]
---

# redirect() en Next.js Server Actions

Cómo funciona la navegación cuando se llama `redirect()` dentro de un Server Action, y por qué es diferente a `router.push()`.

## Cómo funciona

`redirect()` de `next/navigation` dentro de un Server Action **no retorna un valor** — lanza una excepción especial (`NEXT_REDIRECT`) que Next.js intercepta y convierte en una respuesta de redirección al cliente.

```typescript
// Server Action
"use server";
import { redirect } from "next/navigation";

export async function createOrderAction(items, shipping) {
  // ... lógica ...
  const orderId = await insertOrder(...);

  redirect(`/checkout/success?order=${orderId}`);
  // Nada de lo que esté después de esta línea se ejecuta
}
```

## Implicación clave: el return nunca llega al cliente

```typescript
// ❌ Esto nunca se ejecuta si redirect() fue llamado
const result = await createOrderAction(items, shipping);
if (result && "orderId" in result) { // dead code
  router.push(`/success?order=${result.orderId}`);
}
```

Si el Server Action llama `redirect()`, el cliente **nunca recibe** el valor de retorno. El framework maneja la navegación automáticamente.

## Flujo correcto

```typescript
// Diseño 1: Server Action siempre redirige (no retorna orderId)
export async function createOrderAction(...): Promise<{ error: string }> {
  if (hayError) return { error: "mensaje" };
  // ...
  redirect("/success"); // navega directamente, no retorna
}

// En el cliente: solo manejar errores
const result = await createOrderAction(...);
if (result?.error) setServerError(result.error);
// Si no hay error, el redirect ya ocurrió automáticamente
```

```typescript
// Diseño 2: Server Action retorna datos (sin redirect interno)
export async function createOrderAction(...): Promise<{ orderId: string } | { error: string }> {
  if (hayError) return { error: "mensaje" };
  return { orderId: "xxx" };
}

// En el cliente: manejar la navegación
const result = await createOrderAction(...);
if ("error" in result) setServerError(result.error);
else router.push(`/success?order=${result.orderId}`);
```

## Cuándo usar cada diseño

| Situación | Diseño recomendado |
|---|---|
| El destino siempre es el mismo | Server Action redirige internamente |
| El destino varía según la respuesta | Server Action retorna datos, cliente navega |
| Necesitas hacer algo en el cliente antes de navegar (ej: limpiar carrito) | Retornar datos, cliente maneja |
| Flujo externo (PayPal) con retorno | Retornar URL, cliente redirige con `window.location.href` |

## Nota sobre `window.location.href` vs `router.push()`

- `router.push()` — navegación interna de Next.js (cliente), no funciona con URLs externas
- `window.location.href = url` — navegación completa del navegador, funciona con cualquier URL incluyendo dominios externos (necesario para PayPal)

## Relacionado

- [[paypal-redirect-flow]] — usa `window.location.href` para ir a PayPal
- [[cookie-httponly-estado-transitorio]] — cómo preservar estado cuando el redirect es externo
