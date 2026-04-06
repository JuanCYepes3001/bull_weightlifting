# Bull Weightlifting — Roles y Permisos

## Roles

### USER (cliente)
- Registrarse / iniciar sesión
- Ver y editar su perfil y direcciones
- Navegar catálogo y ver productos
- Agregar al carrito
- Realizar compras (checkout + Mercado Pago)
- Ver historial de órdenes propias
- Cancelar órdenes pendientes

### ADMIN
- Todo lo anterior, más:
- CRUD completo de productos, variantes e imágenes
- Gestión de categorías
- Ver todas las órdenes y actualizar estado
- Ver métricas básicas en dashboard
- Gestión de usuarios (cambiar rol)

## Protección de rutas

| Ruta | Requiere | Redirect si falla |
|------|----------|------------------|
| `/profile/**` | Sesión activa | `/login?redirect=...` |
| `/checkout/**` | Sesión activa | `/login?redirect=...` |
| `/orders/**` | Sesión activa | `/login?redirect=...` |
| `/admin/**` | Sesión + role=admin | `/login` o `/` |
| `/login`, `/register` | Sin sesión | `/` |

## Implementación

El rol se almacena en la tabla `profiles.role` (values: `"user"` | `"admin"`).

La protección de rutas se implementa en `src/lib/supabase/middleware.ts`.

La verificación de admin en server components usa `requireAdmin()` desde `src/lib/auth.ts`.

## Crear primer admin

En Supabase Dashboard → SQL Editor:
```sql
UPDATE profiles
SET role = 'admin'
WHERE user_id = '<tu-user-id>';
```
