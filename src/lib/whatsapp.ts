// WhatsApp notifications via Meta Cloud API (WhatsApp Business Platform)
// Required env vars: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID

const ACCESS_TOKEN    = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION     = "v20.0";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("57") && digits.length >= 12) return digits;
  return `57${digits}`;
}

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error("[WhatsApp] WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID not configured — WhatsApp sending disabled");
    return;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formatPhone(to),
          type: "text",
          text: { body },
        }),
      }
    );
    if (!res.ok) {
      console.error("[WhatsApp] Meta API error", res.status, await res.text());
    }
  } catch (err) {
    console.error("[WhatsApp] Network error sending notification:", err);
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
    nequi:         "Nequi",
    daviplata:     "Daviplata",
    contraentrega: "Contra entrega (pago en efectivo al recibir)",
    paypal:        "PayPal",
    dollar_app:    "Dollar App",
    global66:      "Global 66",
    simulado:      "Pago simulado",
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
