---
name: Handoff 2026-04-12 (tarde)
description: Sesión tarde: dashboard stats, PayPal real, métodos manuales, bug fixes trusas/password/logo/IP
type: project
---

## Completado en esta sesión

### Dashboard admin
- `getTopProducts(5)` + `getOrderCompletionStats()` en `admin.ts`
- `TopProductsWidget.tsx` — tasa de completación + top-5 productos
- Pendiente aún: top productos por ingresos vs unidades (ambas métricas están en el componente)

### Pagos
- PayPal: flujo redirect real (sin SDK) — `src/lib/paypal.ts` + `checkout.ts` (createPayPalOrderAction / finalizePayPalOrderAction) + `paypal-return/page.tsx`
- Nequi/Daviplata/Dollar App/Global 66: `payment_status: "pending_verification"`, success page muestra instrucciones por método (`?method=` param)
- Contraentrega: `cod_pending`. Simulado: `approved`
- `checkout.ts` refactorizado con `insertOrder()` compartido

### Bug fixes
- TrusasCustomizer: expandido — nombre, número, diseño (clasico/bull/minimalista), color estampado, medidas (pecho/cadera/largo)
- CartCustomization.color → .printColor (campo renombrado), CartItemRow actualizado
- Botón password: `top-[14px]` → `top-0 h-11 flex items-center` en Login y RegisterForm
- Auth layout: `withMark` agregado a BullLogo — muestra logo imagen
- IP de red: NO es bug de código — cookies son por origen. Documentado en pendiente-configuracion.md

### Documento de configuración pendiente
- `diario/pendiente-configuracion.md` — guía completa: Vercel env vars, Supabase Realtime SQL, URL config, Email templates, PayPal dev account, dominio/DNS

**Why:** Usuario no tiene cuenta Vercel aún ni credenciales de PayPal. Todo el código está listo; solo falta configurar credenciales externas.
**How to apply:** Usar el documento como checklist cuando el usuario esté listo para configurar producción.
