---
tags: [concepto, ecommerce, metricas, analytics, dashboard]
created: 2026-04-12
aliases: [tasa de completación, completion rate, tasa de conversión alternativa, orden completada]
---

# Tasa de completación de órdenes

Métrica de ecommerce que mide qué porcentaje de órdenes creadas llegan a buen término (no son canceladas). Es una alternativa práctica a la tasa de conversión tradicional cuando no se tiene tracking de visitas.

## Fórmula

```
Tasa de completación = (Total órdenes - Canceladas) / Total órdenes × 100
```

## Diferencia con tasa de conversión

| Métrica | Numerador | Denominador | Requiere |
|---|---|---|---|
| Tasa de conversión | Compras | Visitas / sesiones | Tracking de analytics |
| Tasa de completación | Órdenes no canceladas | Total órdenes | Solo datos de órdenes en DB |

La tasa de conversión tradicional (compras / visitas) requiere Google Analytics, Mixpanel u otro sistema de tracking. La tasa de completación solo necesita la tabla de órdenes.

## Interpretación

| Rango | Interpretación |
|---|---|
| ≥ 80% | Saludable — pocas cancelaciones |
| 60–79% | Aceptable — revisar causas de cancelación |
| < 60% | Problemático — alta tasa de abandono post-checkout |

## Implementación en SQL / Supabase

```typescript
export async function getOrderCompletionStats() {
  const { data } = await supabase.from("orders").select("status");

  const total     = data.length;
  const cancelled = data.filter(o => o.status === "cancelled").length;
  const delivered = data.filter(o => o.status === "delivered").length;

  return {
    total,
    delivered,
    cancelled,
    completionRate: total > 0
      ? Math.round(((total - cancelled) / total) * 100)
      : 0,
  };
}
```

## Métricas complementarias

Para una visión más completa del negocio, combinar con:
- **Ticket promedio**: `SUM(total) / COUNT(orders)`
- **Top productos**: qué productos generan más unidades o ingresos — ver [[supabase-realtime]] para datos en tiempo real
- **Tiempo entre orden y entrega**: eficiencia operativa
- **Tasa de recompra**: `usuarios con > 1 orden / usuarios totales`

## Limitaciones

- No mide a los usuarios que vieron productos pero no compraron (abandono de carrito pre-checkout)
- Las cancelaciones pueden ser por razones ajenas al negocio (stock, dirección incorrecta)
- Útil como indicador de salud, no como métrica de marketing

## Relacionado

- [[pagos-verificacion-manual]] — los pagos en `pending_verification` se cuentan como "no cancelados" hasta que el admin los rechace
