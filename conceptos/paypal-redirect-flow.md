---
tags: [concepto, pagos, paypal, api, checkout]
created: 2026-04-12
aliases: [PayPal checkout, PayPal API v2, pago con redirección]
---

# PayPal Redirect Flow (sin SDK)

Integración de pago con PayPal usando su API REST v2 directamente con `fetch`, sin instalar ningún SDK. El usuario es redirigido a PayPal, aprueba el pago y regresa al sitio.

## El flujo en 4 pasos

```
[Tu sitio]                    [PayPal]
    │
    ├─ 1. Crea orden ──────────────────► POST /v2/checkout/orders
    │                                         ◄── { id, approvalUrl }
    │
    ├─ 2. Redirige al usuario ─────────► approvalUrl (página de PayPal)
    │                                    Usuario aprueba
    │                                         ◄── redirect a return_url?token=XXX
    │
    ├─ 3. Captura el pago ────────────► POST /v2/checkout/orders/{token}/capture
    │                                         ◄── { status: "COMPLETED", captureId }
    │
    └─ 4. Crea orden en tu DB ─────────────────────────────────────────────┘
```

## Implementación básica

```typescript
// 1. Obtener token de acceso
async function getAccessToken() {
  const creds = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  return (await res.json()).access_token;
}

// 2. Crear orden
const res = await fetch(`${BASE}/v2/checkout/orders`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    intent: "CAPTURE",
    purchase_units: [{ amount: { currency_code: "USD", value: "10.00" } }],
    application_context: {
      return_url: "https://mi-sitio.com/checkout/paypal-return",
      cancel_url: "https://mi-sitio.com/checkout",
    },
  }),
});
const { id, links } = await res.json();
const approvalUrl = links.find(l => l.rel === "approve").href;
// Redirigir al usuario a approvalUrl

// 3. Capturar (en la página de retorno, con el token de la URL)
const capture = await fetch(`${BASE}/v2/checkout/orders/${token}/capture`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});
```

## Variables de entorno requeridas

```
PAYPAL_CLIENT_ID       # de developer.paypal.com
PAYPAL_CLIENT_SECRET
PAYPAL_MODE            # "sandbox" (pruebas) o "live" (producción)
COP_TO_USD_RATE        # tasa de conversión, ej: 4200
```

## Ventaja vs SDK

- Sin dependencia externa (`@paypal/paypal-js` o similar)
- Más control sobre el flujo
- Consistente con el estilo del proyecto (WhatsApp, Resend, también son fetch directo)

## Problema del estado entre redirects

Cuando el usuario sale de tu sitio hacia PayPal y vuelve, el estado del formulario se pierde. Solución: guardar los datos de checkout en una [[cookie-httponly-estado-transitorio]] antes de redirigir.

## Ambientes

| Variable | Sandbox | Live |
|---|---|---|
| BASE_URL | `api-m.sandbox.paypal.com` | `api-m.paypal.com` |
| Cuentas | Cuentas de prueba del dashboard | Cuentas PayPal reales |

## Relacionado

- [[cookie-httponly-estado-transitorio]] — cómo preservar datos de checkout durante el redirect
- [[pagos-verificacion-manual]] — alternativa para métodos sin API (Nequi, Dollar App)
- [[server-action-redirect]] — cómo manejar el redirect en Next.js
