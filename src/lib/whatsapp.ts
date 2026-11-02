// WhatsApp notifications via Meta Cloud API (WhatsApp Business Platform)
// Required env vars: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID
// Optional: WHATSAPP_TEMPLATE_LANG (default "es")
//
// Every message is an approved *template*: Meta only delivers free-form text
// inside the 24h window after the customer writes to us, and most customers
// never have. The templates must exist in WhatsApp Manager with exactly these
// names, language and variable order — see docs/whatsapp-templates.md.

const ACCESS_TOKEN    = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TEMPLATE_LANG   = process.env.WHATSAPP_TEMPLATE_LANG ?? "es";
const API_VERSION     = "v25.0";

export const WHATSAPP_TEMPLATES = {
  orderConfirmed: "bull_pedido_confirmado",
  orderConfirmedCustomization: "bull_pedido_confirmado_personalizacion",
  statusUpdate: "bull_pedido_actualizacion",
} as const;

export type WhatsAppTemplateMessage = {
  template: (typeof WHATSAPP_TEMPLATES)[keyof typeof WHATSAPP_TEMPLATES];
  params: string[];
};

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // New orders store the number normalized to E.164 (lib/phone.ts)
  if (phone.trim().startsWith("+")) return digits;
  // Legacy orders: raw Colombian number, with or without country code
  if (digits.startsWith("57") && digits.length >= 12) return digits;
  return `57${digits}`;
}

// Meta rejects template parameters that are empty or contain newlines/tabs
// or more than 4 consecutive spaces (error 132018).
function sanitizeParam(value: string): string {
  const clean = value.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim();
  return clean || "-";
}

export async function sendWhatsApp(to: string, message: WhatsAppTemplateMessage): Promise<void> {
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
          type: "template",
          template: {
            name: message.template,
            language: { code: TEMPLATE_LANG },
            components: [
              {
                type: "body",
                parameters: message.params.map((p) => ({ type: "text", text: sanitizeParam(p) })),
              },
            ],
          },
        }),
      }
    );
    if (!res.ok) {
      console.error(`[WhatsApp] Meta API error (template ${message.template})`, res.status, await res.text());
    }
  } catch (err) {
    console.error("[WhatsApp] Network error sending notification:", err);
  }
}

const PAY_LABELS: Record<string, string> = {
  nequi:         "Nequi",
  daviplata:     "Daviplata",
  contraentrega: "Contra entrega (efectivo al recibir)",
  paypal:        "PayPal",
  wompi:         "Wompi (tarjeta / PSE / Nequi)",
  dollar_app:    "Dollar App",
  global66:      "Global 66",
  simulado:      "Pago simulado",
};

const MANUAL_PAYMENT_METHODS = new Set(["nequi", "daviplata", "dollar_app", "global66"]);

const cop = (n: number) => `${n.toLocaleString("es-CO")} COP`;
const shortOrderId = (orderId: string) => orderId.slice(0, 8).toUpperCase();
const firstName = (fullName: string) => fullName.trim().split(/\s+/)[0] || "cliente";

/*
 * bull_pedido_confirmado / bull_pedido_confirmado_personalizacion
 * {{1}} nombre · {{2}} orden · {{3}} estado · {{4}} productos · {{5}} total
 * {{6}} método de pago · {{7}} dirección de envío
 */
export function buildOrderConfirmationMessage(params: {
  orderId: string;
  items: Array<{ productName: string; quantity: number; price: number; size: string; color: string }>;
  total: number;
  paymentMethod: string;
  shipping: { full_name: string; city: string; state: string; address: string };
  // True when the order includes the Trusa Clásica Personalizada
  needsCustomization?: boolean;
}): WhatsAppTemplateMessage {
  const { orderId, items, total, paymentMethod, shipping, needsCustomization = false } = params;

  const status =
    paymentMethod === "contraentrega"
      ? `Confirmado. Pagas ${cop(total)} en efectivo al recibir`
      : MANUAL_PAYMENT_METHODS.has(paymentMethod)
      ? "Pago en verificación"
      : "Pago recibido, en preparación";

  // Single line: template parameters cannot contain line breaks
  const products = items
    .map((i) => `${i.productName} (${i.size} / ${i.color}) x${i.quantity}`)
    .join("; ");

  return {
    template: needsCustomization
      ? WHATSAPP_TEMPLATES.orderConfirmedCustomization
      : WHATSAPP_TEMPLATES.orderConfirmed,
    params: [
      firstName(shipping.full_name),
      shortOrderId(orderId),
      status,
      products,
      cop(total),
      PAY_LABELS[paymentMethod] ?? paymentMethod,
      `${shipping.address}, ${shipping.city}, ${shipping.state}`,
    ],
  };
}

/*
 * bull_pedido_actualizacion
 * {{1}} nombre · {{2}} orden · {{3}} nuevo estado · {{4}} detalle
 */
const STATUS_UPDATES: Record<string, { label: string; detail: string }> = {
  processing: {
    label: "En preparación",
    detail: "Tu pedido ya está en proceso. Te avisaremos apenas sea despachado.",
  },
  shipped: {
    label: "En camino",
    detail: "Tu pedido fue despachado. Entrega estimada: 2 a 5 días hábiles.",
  },
  delivered: {
    label: "Entregado",
    detail: "Tu pedido fue entregado. Si tienes algún problema con él, contáctanos.",
  },
  cancelled: {
    label: "Cancelado",
    detail: "Tu pedido fue cancelado. Si tienes dudas, contáctanos.",
  },
  refunded: {
    label: "Reembolsado",
    detail: "El reembolso puede tardar algunos días hábiles en reflejarse según tu medio de pago.",
  },
};

export function buildStatusUpdateMessage(params: {
  orderId: string;
  status: string;
  customerName: string;
  total: number;
  isContraEntrega: boolean;
}): WhatsAppTemplateMessage | null {
  const update = STATUS_UPDATES[params.status];
  if (!update) return null;

  let detail = update.detail;
  if (params.isContraEntrega && params.status === "shipped") {
    detail += ` Recuerda tener ${cop(params.total)} en efectivo para pagar al recibir.`;
  }

  return {
    template: WHATSAPP_TEMPLATES.statusUpdate,
    params: [firstName(params.customerName), shortOrderId(params.orderId), update.label, detail],
  };
}
