---
tags: [concepto, postgresql, concurrencia, supabase, checkout]
created: 2026-04-14
aliases: [atomic update, decremento atómico, UPDATE atómico]
---

# Operación atómica en SQL

Una **operación atómica** es aquella que ocurre como una sola unidad indivisible: no puede ser interrumpida a la mitad ni observada en estado intermedio por otra operación concurrente.

En bases de datos relacionales, un `UPDATE` con condición `WHERE` es atómico por defecto — PostgreSQL adquiere un lock de fila durante la escritura. El truco es mover toda la lógica (lectura + validación + escritura) dentro de ese único `UPDATE`.

---

## El problema: select-then-update (stale read)

```typescript
// ❌ NO atómico — clásico race condition
const { data: variant } = await supabase
  .from("product_variants")
  .select("stock")
  .eq("id", variantId)
  .single();

// Entre este select y el update de abajo,
// otro proceso puede haber cambiado el stock.
await supabase
  .from("product_variants")
  .update({ stock: variant.stock - qty })  // usa valor stale
  .eq("id", variantId);
```

Si dos usuarios compran el mismo producto simultáneamente:
1. Usuario A lee `stock = 5`
2. Usuario B lee `stock = 5`
3. Usuario A escribe `stock = 3` (5 - 2)
4. Usuario B escribe `stock = 3` (5 - 2) — debería ser 1

Resultado: overselling. El stock queda en 3 en lugar de 1.

---

## La solución: todo en un solo UPDATE

```sql
-- ✅ Atómico — se ejecuta en una sola operación en PostgreSQL
UPDATE product_variants
SET stock = stock - p_qty          -- expresión relativa, no valor absoluto
WHERE id = p_variant_id
  AND stock >= p_qty;              -- validación dentro del mismo UPDATE

-- Si no se actualizó ninguna fila (stock insuficiente),
-- NOT FOUND es true → lanzamos excepción.
IF NOT FOUND THEN
  RAISE EXCEPTION 'insufficient_stock';
END IF;
```

PostgreSQL lockea la fila durante el `UPDATE`. El segundo usuario en llegar espera, lee el stock ya decrementado, y falla el `AND stock >= p_qty` si no hay suficiente stock. **Nunca hay overselling.**

---

## Cómo usarlo desde Supabase

Encapsular en una función PostgreSQL y llamarla via RPC:

```sql
-- migrations/014_decrement_stock_fn.sql
CREATE OR REPLACE FUNCTION decrement_stock(p_variant_id uuid, p_qty int)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE product_variants
  SET stock = stock - p_qty
  WHERE id = p_variant_id AND stock >= p_qty;
  IF NOT FOUND THEN RAISE EXCEPTION 'insufficient_stock'; END IF;
END;
$$;
```

```typescript
// checkout.ts — llamada desde el servidor
const { error } = await supabase.rpc("decrement_stock", {
  p_variant_id: item.variantId,
  p_qty: item.quantity,
});
if (error) {
  // error.message === 'insufficient_stock' → rollback orden
}
```

---

## Cuándo aplicar este patrón

Siempre que la operación sea: **leer un valor → validar → escribir basado en ese valor**, y el sistema pueda tener requests concurrentes. Ejemplos:

- Decrementar stock en un ecommerce
- Reservar asientos en un sistema de tickets
- Transferir saldo entre cuentas
- Incrementar un contador de "cupos disponibles"

---

## Conceptos relacionados

- [[conceptos/patron-antisync-refs]] — patrón distinto para evitar loops de sync en Realtime (concurrencia local, no de DB)
- [[conceptos/supabase-realtime]] — suscripción a cambios de DB, no reemplaza la atomicidad
- [[conceptos/pagos-verificacion-manual]] — flujo de pago donde la validación de stock también es crítica
