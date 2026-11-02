import { createHash, timingSafeEqual } from "node:crypto";

// Wompi (Bancolombia) — Web Checkout redirect integration.
// Docs: https://docs.wompi.co/docs/colombia/widget-checkout-web/
// The sandbox/production environment is inferred from the public key prefix
// (pub_test_… vs pub_prod_…), so switching to real payments is just a matter
// of replacing the four WOMPI_* variables.

const PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY ?? "";
const API_BASE = PUBLIC_KEY.startsWith("pub_prod_")
  ? "https://production.wompi.co/v1"
  : "https://sandbox.wompi.co/v1";

export type WompiStatus = "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";

export interface WompiTransaction {
  id: string;
  reference: string;
  status: WompiStatus;
  amount_in_cents: number;
  currency: string;
  payment_method_type?: string;
}

export function isWompiConfigured(): boolean {
  return Boolean(PUBLIC_KEY && process.env.WOMPI_INTEGRITY_SECRET);
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b.toLowerCase(), "utf8");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/**
 * Builds the Wompi hosted checkout URL. The integrity signature binds
 * reference + amount + currency (+ expiration) so the customer cannot alter
 * the amount in the URL.
 */
export function buildWompiCheckoutUrl(params: {
  reference: string;
  amountInCents: number;
  redirectUrl: string;
  expiresAt: Date;
  customer: { email?: string; fullName: string; phone: string };
}): string {
  const { reference, amountInCents, redirectUrl, expiresAt, customer } = params;
  const currency = "COP";
  const expirationTime = expiresAt.toISOString();
  const signature = sha256(
    `${reference}${amountInCents}${currency}${expirationTime}${process.env.WOMPI_INTEGRITY_SECRET}`
  );

  const qs = new URLSearchParams({
    "public-key": PUBLIC_KEY,
    currency,
    "amount-in-cents": String(amountInCents),
    reference,
    "signature:integrity": signature,
    "redirect-url": redirectUrl,
    "expiration-time": expirationTime,
    "customer-data:full-name": customer.fullName,
  });
  if (customer.email) qs.set("customer-data:email", customer.email);
  const phone = customer.phone.replace(/\D/g, "");
  if (phone.length === 10) {
    qs.set("customer-data:phone-number", phone);
    qs.set("customer-data:phone-number-prefix", "+57");
  }

  return `https://checkout.wompi.co/p/?${qs.toString()}`;
}

/** Fetches a transaction straight from Wompi (public endpoint, source of truth). */
export async function getWompiTransaction(id: string): Promise<WompiTransaction | null> {
  const res = await fetch(`${API_BASE}/transactions/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return (json?.data as WompiTransaction) ?? null;
}

/**
 * Lists the transactions attempted for a reference (requires the private key).
 * Returns null when the lookup is not possible, so callers never cancel an
 * order based on missing information.
 */
export async function findWompiTransactionsByReference(
  reference: string
): Promise<WompiTransaction[] | null> {
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) return null;
  const res = await fetch(
    `${API_BASE}/transactions?reference=${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${privateKey}` }, cache: "no-store" }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return Array.isArray(json?.data) ? (json.data as WompiTransaction[]) : null;
}

/* ─── Webhook (Eventos) ───────────────────────────────────── */

export interface WompiEvent {
  event: string;
  data: { transaction?: WompiTransaction } & Record<string, unknown>;
  environment: string;
  signature: { properties: string[]; checksum: string };
  timestamp: number;
}

/**
 * Verifies an event checksum: SHA256(values of signature.properties, in
 * order, read from event.data + timestamp + events secret).
 * https://docs.wompi.co/docs/colombia/eventos/
 */
export function verifyWompiEvent(evt: WompiEvent): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret || !evt?.signature?.checksum || !Array.isArray(evt.signature.properties)) {
    return false;
  }

  const values = evt.signature.properties.map((path) => {
    const v = path
      .split(".")
      .reduce<unknown>(
        (obj, key) => (obj && typeof obj === "object" ? (obj as Record<string, unknown>)[key] : undefined),
        evt.data
      );
    return v == null ? "" : String(v);
  });

  const expected = sha256(`${values.join("")}${evt.timestamp}${secret}`);
  return safeEqualHex(expected, evt.signature.checksum);
}
