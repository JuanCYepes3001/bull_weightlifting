// WhatsApp notifications via Twilio REST API
// Required env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
// Optional: TWILIO_WHATSAPP_FROM (defaults to sandbox number)

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
const FROM        = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("57") && digits.length >= 12) return `whatsapp:+${digits}`;
  return `whatsapp:+57${digits}`;
}

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  if (!ACCOUNT_SID || !AUTH_TOKEN) return; // silently skip if not configured

  try {
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: FROM,
          To:   formatPhone(to),
          Body: body,
        }).toString(),
      }
    );
  } catch {
    // Non-blocking — never fail the order flow
  }
}

export function buildOrderConfirmationMessage(params: {
  orderId: string;
  items: Array<{ productName: string; quantity: number; price: number; size: string; color: string }>;
  total: number;
  paymentMethod: string;
  shipping: { full_name: string; city: string; state: string; address: string };
}): string {
  const { orderId, items, total, paymentMethod, shipping } = params;
  const shortId = orderId.slice(0, 8).toUpperCase();

  const PAY_LABELS: Record<string, string> = {
    nequi:        "Nequi",
    daviplata:    "Daviplata",
    contraentrega:"Contra entrega (pago en efectivo al recibir)",
    paypal:       "PayPal",
    dollar_app:   "Dollar App",
    global66:     "Global 66",
    simulado:     "Pago simulado",
  };

  const lines = items
    .map((i) => `• ${i.productName} (${i.size} / ${i.color}) × ${i.quantity} — $${(i.price * i.quantity).toLocaleString("es-CO")}`)
    .join("\n");

  const codNote =
    paymentMethod === "contraentrega"
      ? `\n\n💵 *Recuerda:* Al momento de la entrega deberás pagar *$${total.toLocaleString("es-CO")} COP en efectivo*. No se requiere ningún adelanto.`
      : "";

  return (
    `🏋️ *BULL WEIGHTLIFTING*\n` +
    `✅ *¡Orden Confirmada!*\n\n` +
    `*Orden #${shortId}*\n\n` +
    `*Productos:*\n${lines}\n\n` +
    `*Total:* $${total.toLocaleString("es-CO")} COP\n` +
    `*Método de pago:* ${PAY_LABELS[paymentMethod] ?? paymentMethod}\n` +
    `*Dirección:* ${shipping.address}, ${shipping.city}, ${shipping.state}\n` +
    `*Destinatario:* ${shipping.full_name}` +
    codNote +
    `\n\n¡Gracias por tu compra! Pronto confirmaremos el envío. 🚀`
  );
}

export function buildDeliveredMessage(params: {
  orderId: string;
  total: number;
  isContraEntrega: boolean;
}): string {
  const { orderId, total, isContraEntrega } = params;
  const shortId = orderId.slice(0, 8).toUpperCase();

  const codNote = isContraEntrega
    ? `\n\n💵 Esperamos que hayas podido realizar el pago de *$${total.toLocaleString("es-CO")} COP* al mensajero.`
    : "";

  return (
    `🏋️ *BULL WEIGHTLIFTING*\n` +
    `✅ *¡Tu pedido fue entregado!*\n\n` +
    `*Orden #${shortId}*\n` +
    `*Estado:* Entregado` +
    codNote +
    `\n\n¡Gracias por confiar en BULL WEIGHTLIFTING! 💪🏆\nSi tienes algún problema con tu pedido, contáctanos.`
  );
}

export function buildShippedMessage(params: {
  orderId: string;
  total: number;
  isContraEntrega: boolean;
}): string {
  const { orderId, total, isContraEntrega } = params;
  const shortId = orderId.slice(0, 8).toUpperCase();

  const codNote = isContraEntrega
    ? `\n\n💵 *Recuerda:* Deberás pagar *$${total.toLocaleString("es-CO")} COP en efectivo* al recibir el paquete. No se requiere ningún adelanto previo.`
    : "";

  return (
    `🏋️ *BULL WEIGHTLIFTING*\n` +
    `🚚 *¡Tu pedido está en camino!*\n\n` +
    `*Orden #${shortId}*\n` +
    `*Estado:* En tránsito\n` +
    `*Entrega estimada:* 2–5 días hábiles` +
    codNote +
    `\n\n¡Ya viene de camino a ti! 💪`
  );
}
