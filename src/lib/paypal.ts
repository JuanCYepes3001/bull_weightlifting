const BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("PayPal: no se pudo obtener token de acceso");
  const data = await res.json();
  return data.access_token as string;
}

/**
 * Creates a PayPal order. Total is in COP; converts using COP_TO_USD_RATE env var.
 * Returns the PayPal order ID and the approval URL to redirect the user to.
 */
export async function createPayPalOrder(
  totalCOP: number,
  referenceId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ paypalOrderId: string; approvalUrl: string }> {
  const token = await getAccessToken();
  const rate = Number(process.env.COP_TO_USD_RATE ?? 4200);
  const amountUSD = (totalCOP / rate).toFixed(2);

  const res = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: referenceId,
          description: "Bull Weightlifting",
          amount: { currency_code: "USD", value: amountUSD },
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: "Bull Weightlifting",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed: ${text}`);
  }

  const data = await res.json();
  const approvalUrl = (data.links as Array<{ rel: string; href: string }>).find(
    (l) => l.rel === "approve"
  )?.href;

  if (!approvalUrl) throw new Error("PayPal: no se encontró URL de aprobación");
  return { paypalOrderId: data.id as string, approvalUrl };
}

/**
 * Captures a previously approved PayPal order.
 */
export async function capturePayPalOrder(paypalOrderId: string): Promise<{
  status: string;
  captureId: string;
}> {
  const token = await getAccessToken();

  const res = await fetch(
    `${BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed: ${text}`);
  }

  const data = await res.json();
  const capture = (data.purchase_units as Array<any>)?.[0]?.payments?.captures?.[0];
  return {
    status: data.status as string,
    captureId: capture?.id ?? "",
  };
}
