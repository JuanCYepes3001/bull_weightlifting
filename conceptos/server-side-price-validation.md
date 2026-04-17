---
tags: [concepto, seguridad, ecommerce, checkout, server-actions]
created: 2026-04-16
aliases: [validación de precio server-side, confianza en datos del cliente, CWE-602]
---

# Validación de precio en el servidor

**Nunca confíes en datos de precio que vienen del cliente.** En cualquier e-commerce, el precio de un producto debe calcularse exclusivamente en el servidor usando datos de la base de datos, sin importar qué valor envíe el frontend.

Esto aplica a cualquier dato que tenga impacto financiero o de seguridad: precios, descuentos, cantidades máximas, roles de usuario.

---

## El problema: precio controlado por el cliente

```typescript
// ❌ INSEGURO — price viene del cliente
export async function createOrderAction(items: CheckoutItem[]) {
  // items[].price fue enviado por el browser — puede ser cualquier número
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  await insertOrder(total, items); // se cobra lo que el cliente dijo
}
```

Un atacante intercepta la request con DevTools o un proxy (Burp Suite) y cambia:
```json
{ "variantId": "abc", "price": 1, "quantity": 1 }
```
El servidor lo acepta y crea una orden por $1 COP para un producto de $200.000 COP.

---

## La solución: re-fetch de precios desde la DB

```typescript
// ✅ SEGURO — precio viene de la DB, no del cliente
async function insertOrder(items: CheckoutItem[]) {
  const variantIds = items.map(i => i.variantId);

  // Una sola query: stock Y precio en el mismo roundtrip
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, stock, products(price, is_on_sale, sale_price)")
    .in("id", variantIds);

  // Construir mapa de precios canónicos desde la DB
  const priceMap = new Map<string, number>();
  for (const v of variants) {
    const p = v.products;
    priceMap.set(v.id, p.is_on_sale && p.sale_price != null ? p.sale_price : p.price);
  }

  // Total calculado con precios de DB — item.price del cliente se ignora
  const total = items.reduce((s, i) => s + (priceMap.get(i.variantId) ?? 0) * i.quantity, 0);
}
```

---

## Principio general: la superficie de confianza

| Dato | Origen seguro | Origen inseguro |
|------|--------------|-----------------|
| Precio de producto | DB (server) | `item.price` del cliente |
| Stock disponible | DB (server) | Conteo del frontend |
| Rol del usuario | DB / JWT firmado | Cookie manipulable |
| Descuento aplicable | Lógica del servidor | Código de descuento del cliente |
| Cantidad máxima | Regla de negocio del servidor | Input del formulario |

La regla: **cualquier dato que afecte cuánto se cobra o qué acceso se otorga debe venir del servidor**.

---

## En Bull Weightlifting

El fix del 2026-04-16 extendió el query de verificación de stock en `insertOrder` para traer también `products(price, is_on_sale, sale_price)` en el mismo roundtrip. El campo `price` del `CheckoutItem` sigue existiendo en el tipo (necesario para que el carrito del frontend muestre precios), pero el servidor lo ignora completamente al calcular el total y el `unit_price` del RPC.

Lo mismo aplica a `createPayPalOrderAction`: también hace su propio query de precios antes de crear la orden en PayPal, de modo que el monto cobrado tampoco puede ser manipulado.

---

## Conceptos relacionados

- [[conceptos/operacion-atomica-sql]] — el stock también se valida en el servidor (mismo principio)
- [[conceptos/pagos-verificacion-manual]] — flujo donde el total también debe ser verificado manualmente
- [[conceptos/paypal-redirect-flow]] — flujo PayPal donde este fix también aplica
- [[conceptos/cookie-httponly-estado-transitorio]] — datos de sesión de checkout también deben ser server-trusted
