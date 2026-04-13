---
tags: [concepto, patron, react, realtime, refs]
created: 2026-04-12
aliases: [antisync, isSyncing, skipNextSync, evitar loops realtime]
---

# Patrón antisync con refs (isSyncing + skipNextSync)

Patrón de React para evitar loops infinitos cuando se sincroniza estado local con un servidor que a su vez emite eventos de vuelta al cliente.

## El problema

Cuando usas [[supabase-realtime]] u otro sistema de eventos en tiempo real:

1. Dispositivo A escribe al servidor
2. Servidor emite evento de cambio
3. **El propio dispositivo A recibe el evento** y piensa que otro dispositivo cambió algo
4. Dispositivo A vuelve a escribir al servidor → loop infinito

## La solución: dos refs con responsabilidades distintas

```typescript
const isSyncing    = useRef(false); // "yo estoy escribiendo ahora mismo"
const skipNextSync = useRef(false); // "el próximo evento que llegue es mío, ignorarlo"
```

### `isSyncing` — bloquea la escritura propia

Evita que el `useEffect` de outbound sync se dispare mientras ya hay una sincronización en curso.

```typescript
// Outbound sync (local → servidor)
useEffect(() => {
  if (isSyncing.current) return; // ya estoy sincronizando, no hacerlo de nuevo
  isSyncing.current = true;
  syncToServer(items).finally(() => {
    isSyncing.current = false;
  });
}, [items]);
```

### `skipNextSync` — bloquea el echo de vuelta

Cuando el servidor me avisa de un cambio, antes de escribirlo localmente debo saber si fui yo quien lo originó.

```typescript
// Cuando yo escribo al servidor, marco que el próximo evento es mío
skipNextSync.current = true;
await syncToServer(items);

// En el handler de Realtime
.on("postgres_changes", ..., (payload) => {
  if (skipNextSync.current) {
    skipNextSync.current = false;
    return; // era mi propio cambio, ignorar
  }
  replaceItems(payload.new); // era de otro dispositivo, aplicar
})
```

## Por qué dos refs y no uno

- `isSyncing` resuelve el problema **local**: evita que mi propio `useEffect` se auto-dispare.
- `skipNextSync` resuelve el problema **del receptor**: evita que el eco del servidor me haga re-escribir lo que yo mismo escribí.
- Son momentos distintos en el flujo, con condiciones de salida distintas.

## Ejemplo real

Usado en `src/components/CartSyncProvider.tsx` para el sync del carrito entre dispositivos.

## Relacionado

- [[supabase-realtime]] — el sistema de eventos donde se aplica este patrón
