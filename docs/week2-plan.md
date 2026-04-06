# Semana 2 — Plan de Trabajo

## Objetivo principal
Implementar el flujo completo de checkout con Mercado Pago y gestión de órdenes.

## Tareas

### 1. Flujo de Checkout
- [ ] `app/(shop)/checkout/page.tsx` — Paso 1: selección/confirmación dirección
- [ ] `app/(shop)/checkout/summary/page.tsx` — Paso 2: resumen de orden
- [ ] `app/(shop)/checkout/payment/page.tsx` — Redirección a Mercado Pago
- [ ] Crear preferencia MP en `app/actions/checkout.ts`
- [ ] `lib/mercadopago.ts` — instanciar cliente MP con Access Token

### 2. Webhooks Mercado Pago
- [ ] `app/api/webhooks/mercadopago/route.ts` — recibir notificaciones
- [ ] Verificar firma del webhook con `MERCADOPAGO_WEBHOOK_SECRET`
- [ ] Actualizar estado de orden en DB según payment_status
- [ ] Limpiar carrito al confirmar pago

### 3. Páginas post-pago
- [ ] `app/(shop)/checkout/success/page.tsx` — orden confirmada
- [ ] `app/(shop)/checkout/failure/page.tsx` — pago rechazado
- [ ] `app/(shop)/checkout/pending/page.tsx` — pago pendiente

### 4. Historial de órdenes (usuario)
- [ ] `app/(profile)/orders/page.tsx` — lista de órdenes
- [ ] `app/(profile)/orders/[id]/page.tsx` — detalle de orden

### 5. Gestión de órdenes (admin)
- [ ] `app/(admin)/orders/page.tsx` — tabla con todas las órdenes
- [ ] `app/(admin)/orders/[id]/page.tsx` — detalle + cambio de estado
- [ ] `app/actions/orders.ts` — updateOrderStatus action

### 6. Queries y tipos
- [ ] `lib/queries/orders.ts` — getOrders, getOrderById, getUserOrders
- [ ] `lib/validations/checkout.ts` — schema validación checkout
- [ ] Actualizar `types/index.ts` si es necesario

### 7. Email transaccional (opcional Semana 2)
- [ ] Configurar Resend o Supabase Edge Functions
- [ ] Email de confirmación al crear orden
- [ ] Email al actualizar estado

## Dependencias a revisar
- `mercadopago` SDK ya instalado (v2.x)
- Verificar variables de entorno MP en `.env`
- Supabase RLS en tabla `orders`: owner puede leer/crear; admin puede todo

## Criterio de éxito
Un usuario puede: agregar productos → ir al checkout → pagar con MP → ver orden confirmada.
