// Email notifications via Resend
// Required env vars: RESEND_API_KEY, EMAIL_FROM

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "BULL Weightlifting <noreply@bullweightlifting.com>";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) return; // silently skip if not configured

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[Email] Resend error", res.status, await res.text());
    }
  } catch (err) {
    console.error("[Email] Network error sending notification:", err);
  }
}

const COP = (n: number) => "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 });

const PAY_LABELS: Record<string, string> = {
  nequi:         "Nequi",
  daviplata:     "Daviplata",
  contraentrega: "Contra entrega",
  paypal:        "PayPal",
  dollar_app:    "Dollar App",
  global66:      "Global 66",
  simulado:      "Pago simulado",
};

function baseLayout(content: string): string {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body { margin: 0; background: #0a0a0a; font-family: Arial, sans-serif; color: #fff; }
      .container { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
      .logo { font-size: 22px; font-weight: 900; letter-spacing: 0.3em; color: #dc2626; margin-bottom: 24px; }
      .card { background: #111; border: 1px solid #1f1f1f; padding: 24px; margin-bottom: 16px; }
      .label { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #555; margin-bottom: 6px; }
      .value { font-size: 14px; color: #ccc; margin-bottom: 12px; }
      .product-row { border-bottom: 1px solid #1f1f1f; padding: 10px 0; font-size: 13px; color: #aaa; }
      .product-name { color: #fff; font-weight: bold; }
      .total-row { padding-top: 14px; font-size: 22px; font-weight: 900; color: #fff; letter-spacing: 0.05em; }
      .badge { display: inline-block; background: #dc2626; color: #fff; font-size: 11px; padding: 4px 12px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; }
      .footer { font-size: 11px; color: #333; text-align: center; margin-top: 32px; }
      .cod-note { background: #1a1200; border: 1px solid #d97706; padding: 14px; color: #fbbf24; font-size: 13px; margin-top: 12px; }
      a { color: #dc2626; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">BULL WEIGHTLIFTING</div>
      ${content}
      <div class="footer">© 2025 BULL Weightlifting · Colombia</div>
    </div>
  </body>
  </html>`;
}

/**
 * Branded verification email HTML.
 * Pass `confirmationUrl` directly when sending via Resend/custom SMTP.
 * For the Supabase Dashboard template, replace `${confirmationUrl}` with `{{ .ConfirmationURL }}`.
 */
export function getVerificationEmailHtml(confirmationUrl: string): string {
  return baseLayout(`
    <div style="text-align:center;padding:8px 0 24px">
      <div style="display:inline-block;width:48px;height:2px;background:#dc2626;margin-bottom:20px"></div>
      <h1 style="margin:0;font-size:13px;letter-spacing:0.35em;text-transform:uppercase;color:#dc2626;font-weight:900">
        Verifica tu cuenta
      </h1>
    </div>

    <div class="card" style="text-align:center;padding:32px 24px">
      <p style="font-size:15px;color:#ccc;line-height:1.6;margin:0 0 8px">
        Bienvenido a <strong style="color:#fff">BULL Weightlifting</strong>.
      </p>
      <p style="font-size:13px;color:#666;line-height:1.6;margin:0 0 32px">
        Haz clic en el botón para activar tu cuenta y comenzar a entrenar sin parar.
      </p>

      <a href="${confirmationUrl}"
         style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;
                font-size:12px;font-weight:900;letter-spacing:0.25em;text-transform:uppercase;
                padding:14px 36px;margin-bottom:24px">
        Verificar mi cuenta
      </a>

      <p style="font-size:11px;color:#444;margin:0">
        O copia y pega este enlace en tu navegador:<br/>
        <a href="${confirmationUrl}" style="color:#dc2626;word-break:break-all;font-size:11px">
          ${confirmationUrl}
        </a>
      </p>
    </div>

    <p style="font-size:11px;color:#333;text-align:center;margin-top:16px;line-height:1.6">
      Si no creaste esta cuenta, ignora este mensaje.<br/>
      Este enlace expira en 24 horas.
    </p>

    <div style="text-align:center;margin-top:28px;padding-top:20px;border-top:1px solid #1a1a1a">
      <p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#333;margin:0">
        El que para, pierde
      </p>
    </div>
  `);
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderId: string;
  items: Array<{ productName: string; quantity: number; price: number; size: string; color: string }>;
  total: number;
  paymentMethod: string;
  shipping: { full_name: string; city: string; state: string; address: string };
}): Promise<void> {
  const { to, orderId, items, total, paymentMethod, shipping } = params;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const payLabel = PAY_LABELS[paymentMethod] ?? paymentMethod;
  const isCOD = paymentMethod === "contraentrega";

  const itemsHtml = items
    .map(
      (i) => `
      <div class="product-row">
        <span class="product-name">${i.productName}</span>
        <span style="color:#666"> · ${i.size} / ${i.color} · ×${i.quantity}</span>
        <span style="float:right;color:#fff">${COP(i.price * i.quantity)}</span>
      </div>`
    )
    .join("");

  const codNote = isCOD
    ? `<div class="cod-note">💵 <strong>Pago en efectivo:</strong> Al recibir el paquete deberás pagar <strong>${COP(total)} COP</strong>. No se requiere ningún adelanto.</div>`
    : "";

  const html = baseLayout(`
    <div class="badge">✓ Orden confirmada</div>
    <div class="card">
      <div class="label">Número de orden</div>
      <div class="value">#${shortId}</div>
      <div class="label">Destinatario</div>
      <div class="value">${shipping.full_name}</div>
      <div class="label">Dirección</div>
      <div class="value">${shipping.address}, ${shipping.city}, ${shipping.state}</div>
      <div class="label">Método de pago</div>
      <div class="value">${payLabel}</div>
    </div>
    <div class="card">
      <div class="label">Productos</div>
      ${itemsHtml}
      <div class="total-row">${COP(total)} <span style="font-size:12px;color:#555;font-weight:normal">COP</span></div>
    </div>
    ${codNote}
    <p style="font-size:13px;color:#555;margin-top:16px">
      Pronto confirmaremos el despacho de tu pedido. Recibirás otra notificación cuando esté en camino.
    </p>
  `);

  await sendEmail(to, `✅ Orden confirmada #${shortId} — BULL Weightlifting`, html);
}

export async function sendShippedEmail(params: {
  to: string;
  orderId: string;
  total: number;
  isContraEntrega: boolean;
}): Promise<void> {
  const { to, orderId, total, isContraEntrega } = params;
  const shortId = orderId.slice(0, 8).toUpperCase();

  const codNote = isContraEntrega
    ? `<div class="cod-note">💵 Recuerda que deberás pagar <strong>${COP(total)} COP en efectivo</strong> al recibir el paquete.</div>`
    : "";

  const html = baseLayout(`
    <div class="badge" style="background:#0e7490">🚚 En camino</div>
    <div class="card">
      <div class="label">Orden</div>
      <div class="value">#${shortId}</div>
      <div class="label">Estado</div>
      <div class="value">Tu pedido está en tránsito</div>
      <div class="label">Entrega estimada</div>
      <div class="value">2–5 días hábiles</div>
    </div>
    ${codNote}
    <p style="font-size:13px;color:#555;margin-top:16px">¡Ya viene de camino! 💪</p>
  `);

  await sendEmail(to, `🚚 Tu pedido #${shortId} está en camino — BULL Weightlifting`, html);
}

export async function sendDeliveredEmail(params: {
  to: string;
  orderId: string;
  total: number;
  isContraEntrega: boolean;
}): Promise<void> {
  const { to, orderId, total, isContraEntrega } = params;
  const shortId = orderId.slice(0, 8).toUpperCase();

  const codNote = isContraEntrega
    ? `<div class="cod-note">💵 Esperamos que hayas podido completar el pago de <strong>${COP(total)} COP</strong>.</div>`
    : "";

  const html = baseLayout(`
    <div class="badge" style="background:#15803d">✅ Entregado</div>
    <div class="card">
      <div class="label">Orden</div>
      <div class="value">#${shortId}</div>
      <div class="label">Estado</div>
      <div class="value">Tu pedido fue entregado exitosamente</div>
    </div>
    ${codNote}
    <p style="font-size:13px;color:#555;margin-top:16px">
      ¡Gracias por confiar en BULL Weightlifting! 🏆<br/>
      Si tienes algún problema con tu pedido, <a href="mailto:soporte@bullweightlifting.com">contáctanos</a>.
    </p>
  `);

  await sendEmail(to, `✅ Pedido #${shortId} entregado — BULL Weightlifting`, html);
}
