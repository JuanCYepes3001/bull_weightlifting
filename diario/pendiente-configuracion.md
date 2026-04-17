---
tags: [pendiente, configuracion, pagos, vercel, supabase]
created: 2026-04-12
proyecto: "[[proyectos/bull-weightlifting]]"
---

# Pendiente de configuración — Bull Weightlifting

Todo lo que necesitas hacer antes de lanzar a producción. No requiere cambios de código — son solo configuraciones en paneles externos.

---

## 1. Vercel — Variables de entorno

Una vez tengas cuenta en Vercel y el proyecto conectado al repo:

```bash
# Instala Vercel CLI si no lo tienes
npm i -g vercel

# Autentica
vercel login

# Agrega cada variable (te pedirá el valor interactivo)
vercel env add RESEND_API_KEY production
vercel env add EMAIL_FROM production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add PAYPAL_CLIENT_ID production
vercel env add PAYPAL_CLIENT_SECRET production
vercel env add PAYPAL_MODE production          # "live" en producción
vercel env add COP_TO_USD_RATE production      # ej: "4200"
```

O desde el panel web: **Vercel → tu proyecto → Settings → Environment Variables**

### Valores requeridos

| Variable | Descripción | Ejemplo |
|---|---|---|
| `RESEND_API_KEY` | API key de resend.com | `re_xxxxxxxxxxxx` |
| `EMAIL_FROM` | Email remitente verificado en Resend | `noreply@bullweightlifting.com` |
| `NEXT_PUBLIC_SITE_URL` | URL de producción (sin slash final) | `https://bullweightlifting.com` |
| `PAYPAL_CLIENT_ID` | Client ID de la app PayPal | ver PayPal Developer |
| `PAYPAL_CLIENT_SECRET` | Secret de la app PayPal | ver PayPal Developer |
| `PAYPAL_MODE` | Modo PayPal | `sandbox` (pruebas) / `live` (producción) |
| `COP_TO_USD_RATE` | Tasa de conversión COP→USD para PayPal | `4200` |

### Variables de métodos de pago manuales (opcionales, mejoran UX)

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_NEQUI_NUMBER` | Número Nequi del negocio |
| `NEXT_PUBLIC_DAVIPLATA_NUMBER` | Número Daviplata del negocio |
| `NEXT_PUBLIC_DOLLAR_APP_USER` | Usuario Dollar App del negocio |
| `NEXT_PUBLIC_GLOBAL66_ACCOUNT` | Cuenta/email Global 66 del negocio |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp de negocios (con código país) |

---

## 2. Supabase — Configuración de Realtime (cart sync)

En el **SQL Editor** de tu proyecto Supabase:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
```

Solo se corre una vez. Habilita el sync en tiempo real del carrito entre dispositivos.

---

## 3. Supabase — URL Configuration (para IP de red en desarrollo)

**Dashboard → Authentication → URL Configuration:**

- **Site URL**: `http://localhost:3000` (desarrollo) o tu dominio en producción
- **Redirect URLs**: Agregar:
  - `http://localhost:3000/**`
  - `http://192.168.x.x:3000/**` (tu IP de red local, para pruebas cross-device)
  - `https://bullweightlifting.com/**` (producción cuando la tengas)

> **Importante sobre localhost vs IP de red**: Las sesiones de Supabase se guardan como cookies por origen. Si creaste una cuenta en `localhost:3000`, esa sesión no funciona automáticamente en `192.168.x.x:3000` porque son orígenes distintos (comportamiento normal del navegador). Solución: simplemente haz login de nuevo cuando accedas desde la IP. Las credenciales (email/contraseña) son las mismas — lo que cambia es solo la cookie de sesión local.

---

## 4. Supabase — Email Templates (verificación con marca)

**Dashboard → Authentication → Email Templates → Confirm signup:**

Pega el HTML generado por `getVerificationEmailHtml()` de `src/lib/email.ts`.

Para obtenerlo: llama a la función con una URL de prueba, copia el resultado, y pégalo en el campo "Body" del template en el dashboard.

---

## 5. PayPal — Configurar app de desarrollador

1. Ve a [developer.paypal.com](https://developer.paypal.com)
2. Crea una cuenta de negocio (Business account)
3. En **My Apps & Credentials**, crea una nueva app
4. Copia el **Client ID** y **Secret** para las env vars
5. En **Sandbox Accounts** crea cuentas de prueba para testear
6. Cuando estés listo para producción, cambia `PAYPAL_MODE=live`

El flujo implementado:
- Cliente selecciona PayPal → redirige a PayPal (sin SDK, fetch directo a la API)
- PayPal redirige a `/checkout/paypal-return?token=XXX`
- Se captura el pago y se crea la orden en DB

---

## 6. Dominio y DNS

Una vez tengas el dominio:
1. Conectar dominio en Vercel (Settings → Domains)
2. Actualizar `NEXT_PUBLIC_SITE_URL` en Vercel a `https://tu-dominio.com`
3. Actualizar Site URL y Redirect URLs en Supabase Auth
4. Actualizar el remitente en Resend con el dominio verificado

---

## Estado de cada método de pago

| Método | Estado actual | Requiere |
|---|---|---|
| Simulado | Funciona (aprueba siempre) | Nada |
| Contra entrega | Funciona | Nada |
| Nequi | Verificación manual | Configurar `NEXT_PUBLIC_NEQUI_NUMBER` |
| Daviplata | Verificación manual | Configurar `NEXT_PUBLIC_DAVIPLATA_NUMBER` |
| Dollar App | Verificación manual | Configurar `NEXT_PUBLIC_DOLLAR_APP_USER` |
| Global 66 | Verificación manual | Configurar `NEXT_PUBLIC_GLOBAL66_ACCOUNT` |
| PayPal | API real (redirect flow) | Cuenta PayPal developer + env vars |
