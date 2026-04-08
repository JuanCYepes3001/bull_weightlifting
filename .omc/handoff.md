# Handoff — Admin Dashboard Bull Weightlifting
**Fecha:** 2026-04-08  
**Rama:** `juank`  
**Estado:** En progreso — dashboard administrativo funcional al ~95%

---

## Contexto del proyecto

E-commerce de ropa deportiva "Bull Weightlifting".  
Stack: **Next.js 15/16 App Router**, **Supabase** (PostgreSQL + Auth), **Tailwind CSS**, TypeScript.  
Convenciones de estilo: `font-body`, `font-horizon`, `font-bebas`, color `crimson`, fondo `#0D0D0D`, bordes `border-white/5`.  
Todas las mutaciones son **Server Actions** (no API routes, excepto para descarga de archivos).  
`searchParams` y `params` en páginas son **Promises** (Next.js 15 pattern → `await searchParams`).

---

## Lo que se implementó en esta sesión

### 1. Dashboard (`/admin/dashboard`)
- **6 tarjetas de métricas:** Órdenes del Mes, Ingresos del Mes (COP), Productos Activos, Órdenes Pendientes por despachar (**clickeable** → `/admin/orders?status=pending`), Órdenes del Año, Ingresos del Año.
- **Panel de informes** (`ReportDownloader.tsx`) con selector Mensual/Anual, mes y año. Dos botones: **CSV** y **Excel (.xlsx)**.
- Activity log con labels nuevos (`category_created`, `order_updated`, `role_updated`).

### 2. Productos (`/admin/products`)
- Banner **"Producto guardado satisfactoriamente"** al crear/editar → redirige a `/admin/products?saved=true`.
- `createProductAction` y `updateProductAction` ahora redirigen a `?saved=true`.

### 3. Inventario (`/admin/inventory`)
- Stats ampliadas: Productos, **Categorías**, Con stock, Sin stock, Stock bajo, Stock total.
- Nuevo componente `CategoryManager.tsx`: lista categorías + formulario para agregar nueva categoría (nombre + género: hombre/mujer/unisex).
- `createCategoryAction` añadida a `src/app/actions/products.ts`.

### 4. Órdenes (`/admin/orders`) — implementado desde cero
- Tabs de filtro: Todas, Pendientes, En proceso, Enviadas, Entregadas, Canceladas, Reembolsadas.
- Búsqueda client-side por ID de orden o nombre de cliente.
- Cambio de estado inline desde la tabla (dropdown).
- **Página de detalle** (`/admin/orders/[id]`): productos + cantidad + talla + color, fecha completa, total COP, dirección de envío, nombre y teléfono del cliente, actualizador de estado.

### 5. Usuarios (`/admin/users`) — implementado desde cero
- Búsqueda por nombre o correo electrónico.
- Filtro por rol (Todos / Admins / Usuarios).
- Filtro por ubicación (ciudad/departamento desde JSONB `addresses`).
- Toggle rol admin/usuario por fila con confirmación.
- Modal **"Crear admin"**: email + contraseña + nombre (usa Supabase Admin API con service role key).
- Modal **"Asignar admin a usuario existente"**: busca por email.

### 6. Informe descargable (`/api/admin/reports/orders`)
- Parámetros: `format=csv|excel`, `type=monthly|annual`, `year`, `month`.
- CSV con BOM UTF-8; Excel con SheetJS (`xlsx` instalado).
- Columnas: ID, Cliente, Productos, Total COP, Estado, Fecha.

---

## Archivos nuevos o modificados

| Archivo | Acción |
|---|---|
| `src/lib/supabase/admin.ts` | **Nuevo** — cliente service-role |
| `src/lib/queries/admin.ts` | **Reescrito** — stats mensuales/anuales, `getAdminOrders`, `getAdminOrderById`, `getAdminUsers`, `getAdminCategories` |
| `src/app/actions/orders.ts` | **Nuevo** — `updateOrderStatusAction` |
| `src/app/actions/users.ts` | **Nuevo** — `updateUserRoleAction`, `createAdminUserAction`, `assignAdminRoleByEmailAction` |
| `src/app/actions/products.ts` | **Editado** — `createCategoryAction` añadida, redirects a `?saved=true` |
| `src/app/admin/dashboard/page.tsx` | **Reescrito** — nuevas métricas + `ReportDownloader` |
| `src/app/admin/dashboard/ReportDownloader.tsx` | **Nuevo** — panel de descarga CSV/Excel |
| `src/app/admin/products/page.tsx` | **Editado** — banner `?saved=true` |
| `src/app/admin/inventory/page.tsx` | **Reescrito** — stats ampliadas + `CategoryManager` |
| `src/app/admin/inventory/CategoryManager.tsx` | **Nuevo** |
| `src/app/admin/orders/page.tsx` | **Reescrito** — server component con `searchParams` |
| `src/app/admin/orders/OrdersClient.tsx` | **Nuevo** — UI interactiva |
| `src/app/admin/orders/[id]/page.tsx` | **Nuevo** — detalle de orden |
| `src/app/admin/orders/[id]/OrderStatusUpdater.tsx` | **Nuevo** |
| `src/app/admin/users/page.tsx` | **Reescrito** |
| `src/app/admin/users/UsersClient.tsx` | **Nuevo** — búsqueda, filtros, modales |
| `src/app/api/admin/reports/orders/route.ts` | **Nuevo** — API CSV/Excel |

---

## Variables de entorno requeridas (no cambiadas, solo verificar)

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   ← necesaria para módulo de usuarios
```

---

## Estado actual de cada sección

| Sección | Estado |
|---|---|
| Dashboard | ✅ Completo |
| Productos (CRUD, bulk, edición) | ✅ Completo |
| Inventario (stock, variantes, categorías) | ✅ Completo |
| Ofertas | ✅ Completo (ya existía) |
| Órdenes | ✅ Completo |
| Usuarios | ✅ Completo |
| Informe descargable | ✅ Completo (CSV + Excel) |

---

## Pendiente / posibles mejoras futuras

- **Paginación** en tablas de productos, órdenes y usuarios (actualmente carga todo).
- **Realtime** en el activity log (Supabase Realtime subscriptions).
- **Webhooks** de Mercado Pago para actualizar estado de pago automáticamente en órdenes.
- **Exportar** inventario o usuarios a CSV/Excel.
- **Imágenes de categoría** — el campo `image_url` existe en la tabla pero `CategoryManager` no lo gestiona aún.
- **Bulk status update** en órdenes (seleccionar múltiples y cambiar estado a la vez).

---

## Cómo retomar

1. Leer este archivo.
2. Abrir rama `juank`.
3. TypeScript está en 0 errores (`npm run build` o `tsc --noEmit`).
4. Continuar con la sección "Pendiente" o nuevas instrucciones del usuario.
