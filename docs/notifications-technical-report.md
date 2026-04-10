# Informe Técnico: Notificaciones WhatsApp y Email

## Arquitectura general

Tres eventos disparan notificaciones:
1. **Pedido creado** → confirmación inmediata
2. **Estado cambia a `shipped`** → notificación de tránsito
3. **Estado cambia a `delivered`** → confirmación de entrega

---

## 1. WhatsApp (ya implementado parcialmente)

### Servicio recomendado: Twilio WhatsApp API

```bash
# Sin SDK — usa fetch directo (ya implementado en src/lib/whatsapp.ts)
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # sandbox / número productivo
```

### Flujo de disparo

| Evento | Archivo | Función |
|--------|---------|---------|
| Pedido creado | `src/app/actions/checkout.ts` | `sendWhatsApp(phone, buildOrderConfirmationMessage(...))` |
| Enviado (`shipped`) | `src/app/actions/orders.ts` | `sendWhatsApp(phone, buildShippedMessage(...))` |
| Entregado (`delivered`) | `src/app/actions/orders.ts` | Agregar igual que `shipped` |

### Datos usados por notificación

**Pedido creado:**
- `order.id` (short: primeros 8 chars)
- `items[]`: productName, quantity, price, size, color
- `total`
- `paymentMethod` (detecta `contraentrega` para aviso de pago en efectivo)
- `shipping.phone`, `shipping.full_name`, `shipping.city`

**En tránsito / Entregado:**
- `order.id`, `order.total`
- `order.payment_id` (prefijo `CONTRAENTREGA-` indica COD)
- `shipping_address.phone`

### Producción: WhatsApp Business API

Para producción, reemplazar el número sandbox por un número aprobado:
1. Crear cuenta Twilio → activar WhatsApp Sender
2. Aprobar plantillas de mensaje en Meta Business Manager
3. Cambiar `TWILIO_WHATSAPP_FROM=whatsapp:+57XXXXXXXXXX`

Alternativa colombiana: **Sinch** o **360dialog** (menor costo en LATAM).

---

## 2. Email

### Servicio recomendado: Resend (más simple) o Nodemailer + SMTP

#### Opción A — Resend (recomendado para Next.js)

```bash
npm install resend
RESEND_API_KEY=re_xxxx
EMAIL_FROM=noreply@bullweightlifting.com
```

```typescript
// src/lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderId: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
  total: number;
  paymentMethod: string;
}) {
  const { to, orderId, items, total, paymentMethod } = params;
  const shortId = orderId.slice(0, 8).toUpperCase();

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `✅ Orden confirmada #${shortId} — Bull Weightlifting`,
    html: `
      <h2>¡Tu orden fue confirmada!</h2>
      <p><strong>Orden:</strong> #${shortId}</p>
      <ul>
        ${items.map(i => `<li>${i.productName} × ${i.quantity} — $${(i.price * i.quantity).toLocaleString("es-CO")}</li>`).join("")}
      </ul>
      <p><strong>Total:</strong> $${total.toLocaleString("es-CO")} COP</p>
      <p><strong>Método de pago:</strong> ${paymentMethod}</p>
    `,
  });
}

export async function sendShippedEmail(params: {
  to: string;
  orderId: string;
  isContraEntrega: boolean;
  total: number;
}) {
  const shortId = params.orderId.slice(0, 8).toUpperCase();
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `🚚 Tu pedido #${shortId} está en camino`,
    html: `
      <h2>¡Tu pedido está en tránsito!</h2>
      <p>Orden #${shortId} — Entrega estimada: 2–5 días hábiles</p>
      ${params.isContraEntrega ? `<p><strong>Recuerda:</strong> Paga $${params.total.toLocaleString("es-CO")} COP en efectivo al recibir.</p>` : ""}
    `,
  });
}
```

#### Opción B — Nodemailer + SMTP (Gmail / Brevo / Mailgun)

```bash
npm install nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@gmail.com
SMTP_PASS=app-password
```

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html });
}
```

---

## 3. Integración en el flujo de pedidos

```typescript
// En checkout.ts — después de crear la orden:
void sendWhatsApp(shipping.phone, buildOrderConfirmationMessage({...}));
void sendOrderConfirmationEmail({ to: user.email, orderId, items, total, paymentMethod });

// En orders.ts — cuando status === "shipped":
void sendWhatsApp(phone, buildShippedMessage({...}));
void sendShippedEmail({ to: userEmail, orderId, isContraEntrega, total });

// En orders.ts — cuando status === "delivered":
void sendWhatsApp(phone, buildDeliveredMessage({...}));
void sendDeliveredEmail({ to: userEmail, orderId });
```

> **Nota:** Usar `void` hace las notificaciones no-bloqueantes. El flujo del pedido no falla si la notificación falla.

---

## 4. Datos del usuario necesarios

El email del usuario (`auth.users.email`) no está en `orders`. Para obtenerlo en `updateOrderStatusAction`:

```typescript
// Buscar email del usuario dueño de la orden
const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
const userEmail = userData.user?.email ?? "";
```

Esto requiere la **service role key** de Supabase (solo en servidor):

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx
```

```typescript
// src/lib/supabase/admin.ts — ya existe en el proyecto
import { createClient } from "@supabase/supabase-js";
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```
