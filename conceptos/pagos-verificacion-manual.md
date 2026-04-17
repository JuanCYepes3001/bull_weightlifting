---
tags: [concepto, pagos, ecommerce, colombia, latam]
created: 2026-04-12
aliases: [pago manual, pending verification, verificación de pago, Nequi, Dollar App, Global 66]
---

# Pagos con verificación manual

Patrón de ecommerce donde el cliente declara que realizó el pago, pero el negocio lo confirma manualmente antes de procesar el pedido. Común en LatAm con apps como Nequi, Daviplata, Dollar App y Global 66 que no tienen APIs públicas de merchant.

## Cuándo aplicar este patrón

- El método de pago no tiene API de verificación automática
- El negocio puede asumir el riesgo de revisar comprobantes manualmente
- El volumen de órdenes lo permite operativamente

## El flujo

```
Cliente                         Negocio
   │
   ├─ Selecciona método (Nequi)
   ├─ Completa checkout
   ├─ Orden creada con
   │  payment_status: "pending_verification"
   ├─ Ve instrucciones de pago ──► Transfiere dinero a la cuenta del negocio
   ├─ Toma captura de pantalla
   └─ Envía comprobante por WhatsApp
                                    │
                                    ├─ Verifica comprobante
                                    ├─ Actualiza order status en admin
                                    └─ Despacha el pedido
```

## Implementación en Next.js

```typescript
// En el Server Action de checkout
const MANUAL_METHODS = new Set(["nequi", "daviplata", "dollar_app", "global66"]);

const paymentStatus = MANUAL_METHODS.has(paymentMethod)
  ? "pending_verification"
  : "approved"; // simulado, contraentrega, PayPal exitoso

// Redirigir con el método para mostrar instrucciones
redirect(`/checkout/success?order=${orderId}&method=${paymentMethod}`);
```

```tsx
// En la página de éxito — mostrar instrucciones por método
const method = searchParams.get("method");
// Cada método tiene sus propias instrucciones configurables via env vars
```

## Instrucciones típicas por método

| Método | Instrucción |
|---|---|
| Nequi | Enviar monto al número `NEXT_PUBLIC_NEQUI_NUMBER`, mandar screenshot por WhatsApp |
| Daviplata | Igual que Nequi con `NEXT_PUBLIC_DAVIPLATA_NUMBER` |
| Dollar App | Enviar en USD al usuario `NEXT_PUBLIC_DOLLAR_APP_USER` |
| Global 66 | Transferir a `NEXT_PUBLIC_GLOBAL66_ACCOUNT`, confirmar por WhatsApp |

## Diferencia con COD (contraentrega)

- **COD**: el pago ocurre al recibir el pedido, no hay verificación previa. Status: `cod_pending`.
- **Verificación manual**: el pago debe ocurrir ANTES del despacho, el admin lo confirma. Status: `pending_verification`.

## Consideraciones

- El admin debe revisar los comprobantes en el panel de órdenes
- Riesgo: el cliente puede declarar que pagó sin hacerlo. Mitigado por el comprobante vía WhatsApp.
- Para volúmenes altos, considerar integración con APIs reales (Wompi, Bold, MercadoPago).

## Relacionado

- [[paypal-redirect-flow]] — alternativa con verificación automática vía API
- [[supabase-realtime]] — se puede usar para notificar al admin cuando llega un nuevo pedido pending
