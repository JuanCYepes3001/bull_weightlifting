# Bull Weightlifting — Guía de Configuración

## Requisitos previos
- Node.js 20+
- Supabase CLI (`npm install -g supabase`)
- Cuenta en Supabase, Mercado Pago y Vercel

---

## 1. Clonar y instalar

```bash
git clone <repo>
cd bull_weightlifting
npm install
cp .env.example .env.local
```

---

## 2. Supabase — Crear proyecto

1. Ve a [supabase.com](https://supabase.com) → New Project
2. Anota la **Project URL** y la **anon key** (Settings → API)
3. Anota también el **service_role key** (usarlo solo en servidor)

Agrega al `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 3. Ejecutar migraciones SQL

```bash
supabase link --project-ref <project-ref>
supabase db push
```

O manualmente en Supabase Dashboard → SQL Editor, ejecutar en orden:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_functions_triggers.sql`
3. `supabase/migrations/003_rls_policies.sql`
4. `supabase/migrations/004_storage.sql`
5. `supabase/migrations/005_seed_data.sql`
6. `supabase/migrations/006_fix_handle_new_user.sql`

---

## 4. Activar Row Level Security

Las políticas RLS están en `003_rls_policies.sql`. Verificar en
Dashboard → Table Editor → cada tabla → RLS enabled.

---

## 5. Crear primer usuario admin

1. Registra una cuenta en `/register`
2. En Supabase Dashboard → SQL Editor:

```sql
UPDATE profiles
SET role = 'admin'
WHERE user_id = '<tu-auth-user-id>';
```

3. El panel admin estará disponible en `/admin/dashboard`

---

## 6. Mercado Pago

1. Ve a [mercadopago.com.co](https://mercadopago.com.co) → Developers → Credenciales
2. Copia el **Access Token** de prueba (test) o producción

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxxx
MERCADOPAGO_WEBHOOK_SECRET=<tu-webhook-secret>
```

Para webhooks en desarrollo: usa [ngrok](https://ngrok.com) para exponer localhost.

---

## 7. Variables de entorno completas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 8. Desarrollo local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 9. Deploy en Vercel

1. Push al repo GitHub
2. Importar proyecto en [vercel.com](https://vercel.com)
3. Agregar todas las variables de entorno en Settings → Environment Variables
4. Cambiar `NEXT_PUBLIC_APP_URL` al dominio de producción
5. Deploy

---

## 10. Generar tipos TypeScript desde Supabase

```bash
npm run db:types
```

Esto actualiza `src/types/database.ts` con el schema actual.
