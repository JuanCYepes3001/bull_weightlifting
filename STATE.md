---
tags: [estado, bull-weightlifting, activo]
updated: 2026-04-17
proyecto: "[[proyectos/bull-weightlifting]]"
---

# STATE — Bull Weightlifting

> Última actualización: 2026-04-17
> Ver historial completo en [[diario/2026-04-17]] | anteriores: [[diario/2026-04-16b]] [[diario/2026-04-16]]

---

## Fase actual

**Fase 4 — Producción activa + estabilización post-deploy**

El app está desplegada en Vercel. Se resolvieron los primeros 6 bugs post-deploy. Se habilitó Google OAuth en el registro y login. Se expandió la lista de países a 195 (cobertura global). Quedan pendientes configuraciones manuales en Supabase Dashboard para que el correo de verificación y Google OAuth funcionen correctamente en producción.

---

## Stack activo

| Capa | Tecnología |
|---|---|
| Frontend | Next.js App Router, TypeScript, Tailwind v4 |
| DB / Auth | Supabase (PostgreSQL, RLS, Realtime) |
| Estado cliente | Zustand + persist |
| Animaciones | GSAP + ScrollTrigger |
| Email | Resend (fetch directo) |
| Notificaciones | WhatsApp (fetch directo) |
| Pagos | COD, Nequi, Daviplata, Dollar App, Global 66, PayPal (redirect API v2) |

---

## Módulos y estado

| Módulo | Estado |
|---|---|
| Tienda pública `/shop` | ✅ Completo |
| Autenticación `/auth` | ✅ Completo |
| Perfil de usuario `/profile` | ✅ Completo |
| Carrito + sync Realtime | ✅ Completo |
| Checkout multi-método | ✅ Completo |
| Personalización trusas | ✅ Completo (nombre, número, diseño, color, medidas) |
| Panel admin — productos | ✅ Completo |
| Panel admin — órdenes | ✅ Completo |
| Panel admin — inventario | ✅ Completo |
| Panel admin — ofertas | ✅ Completo |
| Panel admin — usuarios | ✅ Completo |
| Panel admin — dashboard | ✅ Completo (stats, gráficos, top productos, tasa completación) |
| Notificaciones email | ✅ Completo (código listo, falta RESEND_API_KEY en producción) |
| Notificaciones WhatsApp | ✅ Completo |
| PayPal API | ✅ Código listo — falta configurar credenciales |
| Deploy / producción | ⏳ Pendiente (sin cuenta Vercel aún) |

---

## Tareas completadas (sesión 2026-04-17 — Google OAuth, registro, países, bugs post-deploy)

- [x] 6 bugs post-deploy resueltos: navbar móvil, dirección no guardada, teléfono faltante, eliminar cuenta, favicon, ruta test eliminada
- [x] `DeleteAccountButton` componente + sección "Zona de Peligro" en `/profile/account`
- [x] Google OAuth: botón "Registrarse con Google" en `RegisterForm.tsx`
- [x] `callback/route.ts` sincroniza nombre de Google al perfil + redirige nuevos usuarios a completar datos (`?welcome=1`)
- [x] Banner de bienvenida en `/profile/account` para nuevos usuarios OAuth
- [x] Lista de países expandida a 195, ordenados alfabéticamente en español (`locationData.ts`)
- [x] `registerAction`: error logging en upsert de perfil para diagnóstico en producción
- [x] Migración `016_fix_handle_new_user.sql`: trigger lee `full_name` (Google) y `name` (email); `ON CONFLICT DO UPDATE`
- [x] Diagnóstico completo: correo de verificación apunta a localhost por `SITE_URL` no configurado en Vercel

---

## Tareas completadas (sesión 2026-04-16 — auditoría seguridad + fixes críticos)

- [x] Auditoría de seguridad completa con Cyber Neo — 5 fases paralelas (SCA, SAST, secrets, config, supply chain)
- [x] **[CN-001]** Precio controlado por cliente — `insertOrder` y `createPayPalOrderAction` ahora obtienen precios desde DB; `item.price` del cliente ignorado completamente (`checkout.ts`)
- [x] **[CN-003]** Rate limiting en auth — `loginAction` (10 req/15 min/IP) y `requestPasswordResetAction` (3 req/15 min/email) (`auth.ts`)
- [x] **[CN-002]** Security headers — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy en `next.config.ts`
- [x] Reporte completo guardado en `~/Desktop/cyber-neo-report-bull-weightlifting-2026-04-16.md`
- [x] Nota de sesión en [[diario/2026-04-16]]

---

## Tareas completadas (sesión 2026-04-14b — auditoría bugs medios/bajos)

- [x] Bug #5+#6: `create_order` RPC transaccional — reemplaza 3 pasos separados, rollback automático (migración 015)
- [x] Bug #7: `VALID_PAYMENT_METHODS` Set en checkout — early return si método no permitido
- [x] Bug #8: `console.error` + `res.ok` check en `whatsapp.ts` y `email.ts`
- [x] Bug #9: `buildAllVariants` sanitize NaN + validación campos vacíos en `onSubmit`
- [x] Bug #10: `OrderStatus` type + `toOrderStatus()` guard en `OrderStatusUpdater`
- [x] Bug #11: `getCategoryBySlug` eliminada (dead code)
- [x] Bug #12: `adminNav` extraído a `admin-nav.ts`
- [x] Bug #14: `timeAgo` guard `isNaN` → devuelve `"—"` en lugar de `NaN`

## Tareas completadas (sesión 2026-04-14 — auditoría bugs críticos/altos)

- [x] Bug #1: `getAdminProducts` con filtros reales + `AdminProductFilters` wired en página admin
- [x] Bug #2: Race condition stock → `decrement_stock` RPC atómica (migración 014)
- [x] Bug #3: Middleware `/admin` protección real con `get_user_role` RPC
- [x] Bug #4: Guard `sale_price != null` en `ProductCard`
- [x] StatusLine configurada (carpeta, rama, modelo, contexto %)

---

## Tareas completadas (sesión 2026-04-13)

- [x] Fix definitivo botón ver contraseña — `<input>` nativo con `pl-4 pr-12` + `inset-y-0`
- [x] Navbar: delay GSAP 1.2s → 0.1s (ya no tarda en aparecer al navegar)
- [x] Logo auth: `size="sm"` → `size="md"` (más visible)
- [x] `createCategoryAction`: agrega `logActivity` + revalida rutas de tienda
- [x] Homepage: `CategoriesSection` restaurada con fetch de categorías real
- [x] Scroll horizontal categorías: wheel interception en `trackRef` + GSAP smooth + barra de progreso

---

## Tareas completadas (sesión 2026-04-12)

### Mañana
- [x] Regenerar tipos Supabase (`supabase gen types typescript`) — TSC 0 errores
- [x] Agregar `admin_activity_log` al tipo manual `database.ts`
- [x] Implementar Supabase Realtime en cart sync (refs `isSyncing` + `skipNextSync`)
- [x] Fix: `registerAction` → pantalla de verificación en lugar de redirect silencioso
- [x] Fix: `loginAction` → mensaje claro para `email_not_confirmed`
- [x] Fix: `emailRedirectTo` usa `NEXT_PUBLIC_SITE_URL`
- [x] Template email de verificación con marca para Supabase Dashboard

### Tarde
- [x] Dashboard: `getTopProducts(5)` + `getOrderCompletionStats()` + `TopProductsWidget`
- [x] PayPal: flujo redirect real (create → approve → capture) sin SDK
- [x] Nequi / Daviplata / Dollar App / Global 66: flujo verificación manual + instrucciones en success page
- [x] Refactor `checkout.ts` con `insertOrder()` compartido
- [x] TrusasCustomizer: expandido a nombre, número, diseño, color, medidas personalizadas
- [x] Fix definitivo botón contraseña (`top-0 h-11 flex items-center`)
- [x] Fix logo en auth layout (`withMark` en BullLogo)
- [x] Crear `diario/pendiente-configuracion.md` — guía completa de producción

---

## Tareas pendientes

### Urgente — configuración Supabase Dashboard (bloquea registro y OAuth)
- [ ] **Ejecutar migración 016** en SQL Editor: `supabase/migrations/016_fix_handle_new_user.sql`
- [ ] **Auth → URL Configuration → Site URL** = `https://bull-weightlifting.vercel.app`
- [ ] **Auth → URL Configuration → Redirect URLs** += `https://bull-weightlifting.vercel.app/api/auth/callback`
- [ ] **Auth → Providers → Google** → habilitar + pegar Client ID y Client Secret de Google Cloud Console
- [ ] **Vercel → Env Vars** → `SITE_URL=https://bull-weightlifting.vercel.app` → Redeploy

### Urgente — migraciones pendientes de sesiones anteriores
- [ ] **Ejecutar migración 014** en Supabase Dashboard → SQL Editor (`supabase/migrations/014_decrement_stock_fn.sql`) — sin esto `decrement_stock` RPC no existe
- [ ] **Ejecutar migración 015** en Supabase Dashboard → SQL Editor (`supabase/migrations/015_create_order_fn.sql`) — sin esto el checkout falla completamente

### Seguridad — hallazgos pendientes de la auditoría 2026-04-16

**Alta prioridad (hacer antes del deploy)**
- [x] **[CN-006/007]** Migrado `xlsx` → `exceljs` — `orders/route.ts` reescrito, `serverExternalPackages` limpio. **Falta ejecutar: `npm uninstall xlsx && npm install exceljs`**
- [ ] **[CN-008]** `npm audit fix` — parchea vulnerabilidad DoS en `next@16.2.2`. **Ejecutar manualmente en rama separada con testing**
- [x] **[CN-004]** Open redirect en auth callback — `src/app/api/auth/callback/route.ts` — `safePath` con regex `^\/(?!\/)` antes del redirect
- [x] **[CN-005]** Monto capturado de PayPal verificado contra `totalUSD` del cookie (tolerancia ±$0.02) — `paypal.ts` + `checkout.ts`

**Media prioridad**
- [x] **[CN-009]** HTML escapado en email templates — `esc()` helper en `email.ts`, aplicado a `productName`, `size`, `color`, `full_name`, `address`, `city`, `state`
- [x] **[CN-010]** Error del RPC en middleware manejado — `middleware.ts:51` ahora loguea y falla cerrado si `get_user_role` falla
- [x] **[CN-011]** CI/CD configurado — `.github/workflows/security.yml` (npm audit en push/PR) + `.github/dependabot.yml` (semanal)
- [x] **[CN-012]** `.env.example` creado con todas las variables; `email.ts` y `whatsapp.ts` ahora loguean error si faltan keys
- [x] **[CN-013]** `listUsers({ perPage: 1000 })` — evita el límite silencioso de 50 usuarios por defecto

**Baja prioridad / Info**
- [x] **[CN-014]** Error interno de Supabase ya no se expone al cliente — `users.ts:52` loguea + mensaje genérico
- [x] **[CN-015]** `NEXT_PUBLIC_SITE_URL` → `SITE_URL` (server-only) en `auth.ts` + `checkout.ts` + `.env.example`
- [x] **[CN-016]** CI ya usa `npm ci`; `.npmrc` creado con `audit=true`
- [x] **[CN-017]** `.npmrc` creado — `registry`, `audit=true`, `fund=false`
- [x] **[CN-018]** `package.json` scripts usan `$SUPABASE_PROJECT_REF` en lugar de ID hardcodeado
- [x] **[CN-019]** Fallback sandbox Twilio eliminado — `TWILIO_WHATSAPP_FROM` es requerido o loguea error
- [x] **[CN-020]** `.gitignore` incluye `*.key` y `*.p12`
- [x] **[CN-021]** `next.config.ts` hostname acotado a `xagdkfvnyniwyykfbrke.supabase.co`
- [x] **[CN-022]** Ya resuelto con CN-011 (dependabot.yml)

### Auditoría de bugs
- ✅ Completada — 14/14 bugs resueltos (ver [[diario/2026-04-14b]])

### Bloqueadas (esperando cuentas externas)
- [ ] **Vercel**: crear cuenta, conectar repo, agregar env vars — ver [[diario/pendiente-configuracion]]
- [ ] **PayPal Developer**: crear app, obtener Client ID + Secret, probar en sandbox
- [ ] **Resend**: verificar dominio de email, configurar `EMAIL_FROM`

### Configuración pendiente (código ya listo)
- [ ] Agregar números reales a `NEXT_PUBLIC_NEQUI_NUMBER`, `NEXT_PUBLIC_DAVIPLATA_NUMBER`, etc.
- [ ] Pegar template HTML en Supabase Dashboard → Auth → Email Templates → Confirm signup
- [ ] Añadir IP de red a Supabase → Auth → URL Configuration → Redirect URLs (para pruebas cross-device)

### Próxima sesión — post-deploy
- [ ] **Notificación WhatsApp al admin** — cuando llega un nuevo pedido, enviar mensaje al número de la empresa con resumen del pedido
- [ ] **Integrar imágenes faltantes** — revisar con la dueña qué imágenes faltan y subirlas al bucket de Supabase
- [ ] **Pruebas funcionales completas** — emails de verificación de registro, emails de confirmación de pedido, WhatsApp al cliente
- [ ] **Reunión con la dueña** — recopilar feedback y definir próximas features

### Features futuras (backlog)
- [ ] Tasa de conversión real (requiere tracking de sesiones/visits)
- [ ] Top productos por ingresos (ya está en el widget, agregar toggle)
- [ ] Estadísticas: ticket promedio, productos más devueltos
- [ ] Dominio propio y configuración DNS

---

## Decisiones técnicas importantes

| Decisión | Razón |
|---|---|
| PayPal sin SDK (fetch directo a API v2) | Consistente con el estilo del proyecto (email, WhatsApp, todo sin SDK) |
| Cookie httpOnly para datos pendientes de PayPal entre redirect | Evita exponer datos de checkout en URL o localStorage |
| Tasa COP→USD configurable via `COP_TO_USD_RATE` env var | El tipo de cambio varía; no hardcodear |
| `payment_status: "pending_verification"` para pagos manuales | Permite al admin confirmar recibo antes de despachar |
| SVG puro para gráficos del dashboard | Sin dependencias pesadas (recharts/chart.js) |
| `replaceItems()` atómico en el carrito | Evita renders intermedios y loops de sync |
| Dos refs (`isSyncing` + `skipNextSync`) para Realtime | Resuelven problemas distintos: local vs receptor |
| `decrement_stock` RPC en lugar de update desde JS | Único UPDATE atómico en PostgreSQL evita race condition de overselling |
| Verificación de rol en middleware, no solo en layout | El middleware corre en el Edge antes de cualquier render; el layout es demasiado tarde para proteger datos |
| `create_order` RPC reemplaza flujo multi-paso en JS | Una función PL/pgSQL con transacción implícita garantiza atomicidad; el rollback manual en JS no es fiable bajo fallos de red |
| `VALID_PAYMENT_METHODS` Set en checkout | Boundary de entrada — cualquier string arbitrario se rechaza antes de tocar la DB |
| `console.error` en libs de notificación, no en el caller | El error pertenece a la lib; el flujo de checkout no debe bifurcarse por fallos de notificación |
| `toOrderStatus()` helper en lugar de cast directo | Centraliza la validación del enum; si los valores cambian, se actualiza en un solo lugar |
| Ignorar `item.price` del cliente completamente (no validar desviación) | Más simple y más seguro que validar tolerancia; si el precio cambió el frontend debe refrescarse igual |
| Rate limiter in-memory en lugar de nueva dependencia | Evita cambios al package.json; efectivo para single-instance. Para Vercel multi-instancia reemplazar con @upstash/ratelimit + Redis |
| Mantener `unsafe-inline` en CSP por ahora | Eliminarlo requiere nonce-based CSP, cambio más invasivo. Se documenta en comentario en el código |
| No aplicar `npm audit fix` en esta sesión | Cambio de versión de Next.js puede introducir breaking changes; mejor hacerlo en rama separada con testing |

---

## Bloqueos actuales

| Bloqueo | Impacto | Solución |
|---|---|---|
| `SITE_URL` no configurado en Vercel | Correo de verificación apunta a localhost; links rotos | Agregar `SITE_URL=https://bull-weightlifting.vercel.app` en Vercel |
| Supabase Site URL apunta a localhost | Email de verificación tiene link incorrecto | Auth → URL Configuration → Site URL en Dashboard |
| Google OAuth no habilitado en Supabase | Botón "Registrarse con Google" no funciona | Auth → Providers → Google → habilitar + credenciales |
| Migración 016 no ejecutada en DB | Trigger sigue leyendo solo `name` (falla con Google OAuth) | Ejecutar `016_fix_handle_new_user.sql` en SQL Editor |
| Migración 014 no ejecutada en DB | `checkout.ts` llama `decrement_stock` RPC que aún no existe | Ejecutar `014_decrement_stock_fn.sql` en SQL Editor |
| Migración 015 no ejecutada en DB | `checkout.ts` llama `create_order` RPC que aún no existe | Ejecutar `015_create_order_fn.sql` en SQL Editor |
| Sin credenciales PayPal | El flujo PayPal cae al error "no configurado" | Crear app en developer.paypal.com |
| `RESEND_API_KEY` no configurada en prod | Emails transaccionales no se envían | Agregar a Vercel env vars |

---

## Variables de entorno requeridas

Ver guía completa: [[diario/pendiente-configuracion]]

```
# Supabase (ya configuradas en .env.local)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Site
NEXT_PUBLIC_SITE_URL          # localhost:3000 en dev, dominio en prod

# Email
RESEND_API_KEY                # pendiente en producción
EMAIL_FROM                    # pendiente en producción

# WhatsApp
WHATSAPP_API_URL
WHATSAPP_API_TOKEN
WHATSAPP_PHONE_NUMBER_ID

# PayPal
PAYPAL_CLIENT_ID              # pendiente
PAYPAL_CLIENT_SECRET          # pendiente
PAYPAL_MODE                   # sandbox | live

# Métodos de pago manuales (opcionales, mejoran UX)
NEXT_PUBLIC_NEQUI_NUMBER
NEXT_PUBLIC_DAVIPLATA_NUMBER
NEXT_PUBLIC_DOLLAR_APP_USER
NEXT_PUBLIC_GLOBAL66_ACCOUNT
NEXT_PUBLIC_WHATSAPP_NUMBER
```
