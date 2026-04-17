---
tags: [concepto, typescript, react, jsx, defensive-programming]
created: 2026-04-14
aliases: [null guard, guard de nulabilidad, optional chaining JSX]
---

# Guard de nulabilidad en JSX

En JSX, un valor `null` o `undefined` renderiza como nada (string vacío). Esto hace que los bugs de nulabilidad sean **silenciosos** — no crashean, solo muestran UI rota o incompleta.

---

## El problema: optional chaining no es suficiente

```tsx
// ❌ Parece seguro, pero no lo es
{isSaleActive ? (
  <p>${product.sale_price?.toLocaleString("es-CO")}</p>
) : (
  <p>${product.price.toLocaleString("es-CO")}</p>
)}
```

Si `is_on_sale = true` pero `sale_price = null` (dato inconsistente en DB):

- `isSaleActive` → `true` (evalúa fechas, no el precio)
- `product.sale_price?.toLocaleString()` → `undefined`
- React renderiza `undefined` como nada
- El usuario ve: **`$`** — el símbolo solo, sin número

No hay error, no hay warning. Solo UI silenciosamente rota.

---

## Por qué ocurre

`?.` (optional chaining) previene el crash pero no previene el render vacío:

```typescript
null?.toLocaleString("es-CO")  // → undefined (no crash)
undefined?.toLocaleString()    // → undefined (no crash)

// En JSX:
<p>${undefined}</p>  // renderiza: "$"
<p>${null}</p>       // renderiza: "$"
```

El guard real debe estar en la **condición del bloque**, no en el accessor del valor.

---

## La solución: guard en la condición

```tsx
// ✅ El guard cierra el bloque completo si el valor no existe
{isSaleActive && product.sale_price != null ? (
  <p>${product.sale_price.toLocaleString("es-CO")}</p>
) : (
  <p>${product.price.toLocaleString("es-CO")}</p>
)}
```

Ahora si `sale_price` es `null`:
- La condición entera es `false`
- Cae al `else` → muestra el precio regular
- Cero UI rota, cero crashes

Y el `?.` puede eliminarse: si el guard pasó, TypeScript sabe que `sale_price` no es null.

---

## Regla general

> Cuando un bloque JSX depende de un valor para renderizarse correctamente, **verificar la existencia de ese valor en la condición del bloque**, no solo con `?.` dentro del bloque.

```tsx
// Patrón correcto
{condition && value != null ? (
  <Component value={value} />  // value garantizado como no-null aquí
) : (
  <Fallback />
)}
```

---

## Cuándo usar `!= null` vs `!== null`

- `!= null` captura tanto `null` como `undefined` (doble igual, más amplio)
- `!== null` solo captura `null`, `undefined` pasaría

Para datos de DB (Supabase devuelve `null` para campos vacíos, nunca `undefined`), ambos funcionan. `!= null` es más seguro como defecto general.

---

## Conceptos relacionados

- [[conceptos/tasa-de-completacion]] — otro caso donde datos de DB pueden ser 0 o null y hay que guardar divisiones
- [[conceptos/pagos-verificacion-manual]] — campos opcionales en órdenes que pueden ser null
