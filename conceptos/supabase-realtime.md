---
tags: [concepto, supabase, websockets, tiempo-real]
created: 2026-04-12
aliases: [Realtime, supabase realtime, cambios en tiempo real]
---

# Supabase Realtime

Mecanismo de Supabase que envía cambios de la base de datos a los clientes conectados en tiempo real, sin necesidad de hacer polling.

## Cómo funciona

Supabase usa PostgreSQL `LISTEN/NOTIFY` y WebSockets. Cuando una fila cambia en una tabla habilitada, Supabase emite un evento a todos los clientes suscritos a esa tabla (o a un filtro específico de esa tabla).

## Ejemplo práctico

```typescript
// Suscribirse a cambios en cart_items de UN carrito específico
const channel = supabase
  .channel("cart-sync")
  .on(
    "postgres_changes",
    {
      event: "*",           // INSERT, UPDATE o DELETE
      schema: "public",
      table: "cart_items",
      filter: `cart_id=eq.${cartId}`,  // filtro por fila
    },
    (payload) => {
      // Se ejecuta cuando otro dispositivo modifica el carrito
      reloadCart();
    }
  )
  .subscribe();

// Limpiar al desmontar
return () => { supabase.removeChannel(channel); };
```

## Requisito previo

La tabla debe estar habilitada en la publicación de Realtime:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
```

Por defecto, ninguna tabla está habilitada.

## Consideraciones

- Los eventos llegan a **todos** los clientes suscritos, incluyendo el que hizo el cambio.
- Si no se controla, puede generar loops: el dispositivo A escribe → evento llega a A → A vuelve a escribir → loop.
- Ver [[patron-antisync-refs]] para la solución a este problema.
- Los filtros (`filter: "cart_id=eq.xxx"`) reducen el tráfico significativamente.

## Relacionado

- [[patron-antisync-refs]] — cómo evitar loops con isSyncing y skipNextSync
- [[server-action-redirect]] — alternativa para sincronizar via servidor
