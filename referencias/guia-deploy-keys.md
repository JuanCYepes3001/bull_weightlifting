---
tags: [referencia, deploy, keys, vercel, twilio, resend, paypal]
created: 2026-04-16
proyecto: "[[proyectos/bull-weightlifting]]"
---

# Guía de Deploy — Cómo obtener cada Key

> Referencia completa para el deploy en Vercel. Cada servicio es gratuito para empezar.

---

## 1. Vercel — Deploy gratuito

**Plan Hobby = $0/mes.** Suficiente para lanzar la app.

**Pasos:**
1. Ir a `vercel.com` → Sign Up con GitHub
2. New Project → Import `bull_weightlifting`
3. Framework: Next.js (se detecta solo)
4. Branch: `juank`
5. Ir a **Environment Variables** antes de hacer Deploy
6. Pegar todas las keys del paso 2–5 de esta guía
7. Click **Deploy**

**Después del deploy:** copiar la URL generada (ej. `https://bull-weightlifting-xxxx.vercel.app`) y usarla como `SITE_URL`.

**Agregar en Supabase después:**
- Supabase Dashboard → Authentication → URL Configuration
- Redirect URLs → Agregar `https://tu-url.vercel.app/**`

---

## 2. Supabase — Ya tienes las keys

> Ya configuradas en `.env.local`. Solo copiarlas a Vercel.

| Variable | Dónde encontrarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon / public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role ⚠️ secreto |

URL del dashboard: `https://supabase.com/dashboard/project/xagdkfvnyniwyykfbrke/settings/api`

---

## 3. Twilio — WhatsApp (Gratis para pruebas)

**Costo:** Gratis en sandbox. En producción: ~$0.005 USD por mensaje.

**Pasos:**
1. Ir a `twilio.com` → Sign Up (gratis)
2. Verificar email y número de teléfono
3. En el dashboard principal verás directamente:
   - **Account SID** → copiar como `TWILIO_ACCOUNT_SID`
   - **Auth Token** → click en el ojo para verlo → copiar como `TWILIO_AUTH_TOKEN`
4. Para WhatsApp Sandbox:
   - Messaging → Try it out → Send a WhatsApp message
   - El número sandbox es siempre `+14155238886`
   - `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886`
5. Para que lleguen los mensajes, cada número de prueba debe enviar primero:
   - Un mensaje al sandbox con el código que indica Twilio (ej. `join <código>`)

**Para producción (número real):**
- Messaging → Senders → WhatsApp Senders → Request Access
- Requiere aprobación de Meta (tarda ~1 semana)

---

## 4. Resend — Email (Gratis hasta 3,000 emails/mes)

**Costo:** Gratis hasta 3,000 emails/mes y 100 al día.

**Pasos:**
1. Ir a `resend.com` → Sign Up (gratis)
2. API Keys → Create API Key → nombre: `bull-weightlifting`
3. Copiar la key → `RESEND_API_KEY`

**Para pruebas sin dominio propio:**
```
EMAIL_FROM=BULL Weightlifting <onboarding@resend.dev>
```
Funciona inmediatamente, sin verificar nada.

**Para producción con dominio propio (más profesional):**
- Resend Dashboard → Domains → Add Domain
- Seguir los pasos para agregar registros DNS
- Luego usar: `EMAIL_FROM=BULL Weightlifting <noreply@tudominio.com>`

---

## 5. PayPal — Sandbox gratuito para pruebas

**Costo:** Gratis en sandbox. En producción cobra comisión por transacción (~3.4% + tarifa fija).

**Pasos:**
1. Ir a `developer.paypal.com`
2. Log in con tu cuenta PayPal normal (o crear una)
3. Apps & Credentials → pestaña **Sandbox**
4. Create App → nombre: `bull-weightlifting-sandbox`
5. Copiar:
   - **Client ID** → `PAYPAL_CLIENT_ID`
   - **Secret** → click en "Show" → `PAYPAL_CLIENT_SECRET`
6. `PAYPAL_MODE=sandbox`

**Para probar pagos en sandbox:**
- Sandbox → Accounts → hay cuentas de prueba de comprador ya creadas
- Usar esas credenciales al hacer checkout con PayPal

**Para ir a producción:**
- Cambiar a pestaña **Live** en Apps & Credentials
- Crear nueva app Live
- Cambiar `PAYPAL_MODE=live`

---

## 6. Variables del negocio — Pedirle a la dueña

```env
NEXT_PUBLIC_NEQUI_NUMBER=57XXXXXXXXXX       # Número Nequi registrado
NEXT_PUBLIC_DAVIPLATA_NUMBER=57XXXXXXXXXX   # Número Daviplata registrado
NEXT_PUBLIC_DOLLAR_APP_USER=@usuario        # Usuario en Dollar App
NEXT_PUBLIC_GLOBAL66_ACCOUNT=datos          # Cuenta Global 66
NEXT_PUBLIC_WHATSAPP_NUMBER=57XXXXXXXXXX    # WhatsApp de la empresa (sin +)
```

---

## 7. Variables fijas (no cambian)

```env
COP_TO_USD_RATE=4200    # Ajustar según TRM del día para PayPal
PAYPAL_MODE=sandbox     # Cambiar a "live" cuando vayan a producción real
```

---

## Checklist de deploy

- [ ] Crear cuenta Twilio → copiar Account SID + Auth Token
- [ ] Crear cuenta Resend → copiar API Key
- [ ] Crear app PayPal sandbox → copiar Client ID + Secret
- [ ] Hacer deploy en Vercel → copiar URL generada como SITE_URL
- [ ] Agregar URL de Vercel en Supabase Redirect URLs
- [ ] Agregar números del negocio (pedirle a la dueña)
- [ ] Ejecutar migración 014 en Supabase SQL Editor
- [ ] Ejecutar migración 015 en Supabase SQL Editor
- [ ] Probar: registro + email verificación
- [ ] Probar: pedido + email confirmación + WhatsApp

---

## Notas relacionadas

- [[proyectos/bull-weightlifting]]
- [[diario/pendiente-configuracion]]
- [[diario/2026-04-16]]
