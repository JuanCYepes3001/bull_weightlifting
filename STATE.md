---
tags: [estado, bull-weightlifting, activo]
updated: 2026-04-14
proyecto: "[[proyectos/bull-weightlifting]]"
---

# STATE — Bull Weightlifting

> Última actualización: 2026-04-14  
> Ver historial completo en [[diario/2026-04-14]]

---

## Fase actual

**Fase 3 — Features completas, pendiente de configuración y producción**

El grueso del desarrollo está terminado. El proyecto corre localmente y en red local. El siguiente paso es configurar las cuentas externas (Vercel, PayPal) y hacer el deploy inicial.

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

## Tareas completadas (sesión 2026-04-14)

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

### Urgente — antes del deploy
- [ ] **Ejecutar migración 014** en Supabase Dashboard → SQL Editor (`supabase/migrations/014_decrement_stock_fn.sql`) — sin esto el checkout lanza error en producción

### Auditoría — bugs media/baja severidad
- [ ] Continuar con los bugs restantes de la auditoría (severidad media y baja)

### Bloqueadas (esperando cuentas externas)
- [ ] **Vercel**: crear cuenta, conectar repo, agregar env vars — ver [[diario/pendiente-configuracion]]
- [ ] **PayPal Developer**: crear app, obtener Client ID + Secret, probar en sandbox
- [ ] **Resend**: verificar dominio de email, configurar `EMAIL_FROM`

### Configuración pendiente (código ya listo)
- [ ] Agregar números reales a `NEXT_PUBLIC_NEQUI_NUMBER`, `NEXT_PUBLIC_DAVIPLATA_NUMBER`, etc.
- [ ] Pegar template HTML en Supabase Dashboard → Auth → Email Templates → Confirm signup
- [ ] Añadir IP de red a Supabase → Auth → URL Configuration → Redirect URLs (para pruebas cross-device)

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

---

## Bloqueos actuales

| Bloqueo | Impacto | Solución |
|---|---|---|
| Sin cuenta Vercel | No se puede hacer deploy a producción | Crear cuenta en vercel.com |
| Sin credenciales PayPal | El flujo PayPal cae al error "no configurado" | Crear app en developer.paypal.com |
| `RESEND_API_KEY` no configurada en prod | Emails no se envían en producción | Agregar a Vercel env vars |
| IP de red en Supabase Redirect URLs | OAuth y links de verificación pueden fallar desde otros dispositivos | Agregar en Supabase Dashboard |
| Migración 014 no ejecutada en DB | `checkout.ts` llama `decrement_stock` RPC que aún no existe en Supabase | Ejecutar `014_decrement_stock_fn.sql` en SQL Editor |

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
