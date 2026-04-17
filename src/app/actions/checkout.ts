"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsApp, buildOrderConfirmationMessage } from "@/lib/whatsapp";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { createPayPalOrder, capturePayPalOrder } from "@/lib/paypal";

export interface CheckoutItem {
  variantId: string;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zip_code?: string;
  notes?: string;
}

export type CheckoutResult = { error: string } | { orderId: string };

// All accepted payment methods — any other value is rejected before hitting the DB
const VALID_PAYMENT_METHODS = new Set([
  "nequi", "daviplata", "dollar_app", "global66",
  "contraentrega", "simulado",
]);

// Payment methods that require manual verification before fulfillment
const MANUAL_METHODS = new Set(["nequi", "daviplata", "dollar_app", "global66"]);

/* ─── Shared: create DB order ──────────────────────────── */

// Resolved product type from the joined query
type VariantWithPrice = {
  id: string;
  stock: number;
  products: { price: number; is_on_sale: boolean; sale_price: number | null } | null;
};

async function insertOrder(
  items: CheckoutItem[],
  shipping: ShippingAddress,
  paymentMethod: string,
  paymentId: string,
  paymentStatus: string
): Promise<{ orderId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión para completar la compra" };

  // Fetch stock AND canonical prices from DB — client-supplied prices are never trusted
  const variantIds = items.map((i) => i.variantId);
  const { data: variants, error: stockError } = await supabase
    .from("product_variants")
    .select("id, stock, products(price, is_on_sale, sale_price)")
    .in("id", variantIds);

  if (stockError || !variants) return { error: "Error al verificar disponibilidad" };

  // Build server-side price map from DB values
  const priceMap = new Map<string, number>();
  for (const v of variants as VariantWithPrice[]) {
    if (v.products) {
      const p = v.products;
      priceMap.set(v.id, p.is_on_sale && p.sale_price != null ? p.sale_price : p.price);
    }
  }

  for (const item of items) {
    const v = (variants as VariantWithPrice[]).find((v) => v.id === item.variantId);
    if (!v) return { error: `Variante no encontrada para ${item.productName}` };
    if (v.stock < item.quantity)
      return {
        error: `Sin stock suficiente para ${item.productName} (${item.size} / ${item.color})`,
      };
    if (!priceMap.has(item.variantId))
      return { error: `Precio no disponible para ${item.productName}` };
  }

  // Total computed exclusively from DB prices — client-supplied item.price is ignored
  const total = items.reduce((s, i) => s + (priceMap.get(i.variantId) ?? 0) * i.quantity, 0);

  // Single transactional RPC: inserts order + order_items + decrements stock
  // atomically. Any failure (network, insufficient stock, constraint) rolls back
  // everything — no orphan orders, no inconsistent stock (fixes #5 and #6).
  const { data: orderId, error: orderError } = await supabase.rpc("create_order", {
    p_user_id: user.id,
    p_status: "pending",
    p_total: total,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p_shipping_address: shipping as any,
    p_payment_id: paymentId,
    p_payment_status: paymentStatus,
    p_notes: shipping.notes || null,
    p_items: items.map((i) => ({
      variant_id: i.variantId,
      quantity: i.quantity,
      unit_price: priceMap.get(i.variantId) ?? 0,  // DB price, not client price
    })),
  });

  if (orderError || !orderId) {
    const isStockError = orderError?.message?.includes("insufficient_stock");
    return {
      error: isStockError
        ? "Sin stock suficiente para uno o más productos del carrito"
        : "Error al crear la orden. Intenta de nuevo.",
    };
  }

  const order = { id: orderId as string };

  // Non-blocking notifications
  void sendWhatsApp(
    shipping.phone,
    buildOrderConfirmationMessage({ orderId: order.id, items, total, paymentMethod, shipping })
  );
  if (user && "email" in user && user.email) {
    void sendOrderConfirmationEmail({
      to: user.email,
      orderId: order.id,
      items,
      total,
      paymentMethod,
      shipping,
    });
  }

  return { orderId: order.id };
}

/* ─── Standard checkout (Nequi / Daviplata / COD / Simulado) */

export async function createOrderAction(
  items: CheckoutItem[],
  shipping: ShippingAddress,
  paymentMethod: string
): Promise<CheckoutResult> {
  if (!items.length) return { error: "El carrito está vacío" };
  if (!VALID_PAYMENT_METHODS.has(paymentMethod))
    return { error: "Método de pago no válido." };

  const isManual = MANUAL_METHODS.has(paymentMethod);
  const paymentStatus = isManual
    ? "pending_verification"
    : paymentMethod === "contraentrega"
    ? "cod_pending"
    : "approved"; // simulado

  const result = await insertOrder(
    items,
    shipping,
    paymentMethod,
    `${paymentMethod.toUpperCase()}-${Date.now()}`,
    paymentStatus
  );

  if ("error" in result) return result;

  redirect(
    `/checkout/success?order=${result.orderId}${isManual ? `&method=${paymentMethod}` : ""}`
  );
}

/* ─── PayPal: step 1 — create order + store pending data ── */

export async function createPayPalOrderAction(
  items: CheckoutItem[],
  shipping: ShippingAddress
): Promise<{ approvalUrl: string } | { error: string }> {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return { error: "PayPal no está configurado en este servidor." };
  }

  // Re-fetch canonical prices from DB — client-supplied prices are never trusted
  const supabase = await createClient();
  const variantIds = items.map((i) => i.variantId);
  const { data: pricingVariants, error: priceError } = await supabase
    .from("product_variants")
    .select("id, products(price, is_on_sale, sale_price)")
    .in("id", variantIds);

  if (priceError || !pricingVariants) return { error: "Error al verificar precios." };

  const paypalPriceMap = new Map<string, number>();
  for (const v of pricingVariants as VariantWithPrice[]) {
    if (v.products) {
      const p = v.products;
      paypalPriceMap.set(v.id, p.is_on_sale && p.sale_price != null ? p.sale_price : p.price);
    }
  }

  const total = items.reduce((s, i) => s + (paypalPriceMap.get(i.variantId) ?? 0) * i.quantity, 0);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const { paypalOrderId, approvalUrl } = await createPayPalOrder(
      total,
      `bull-${Date.now()}`,
      `${siteUrl}/checkout/paypal-return`,
      `${siteUrl}/checkout`
    );

    // Store pending checkout in a short-lived cookie (totalUSD used to verify captured amount)
    const rate = Number(process.env.COP_TO_USD_RATE ?? 4200);
    const totalUSD = (total / rate).toFixed(2);
    const jar = await cookies();
    jar.set(
      "paypal_pending",
      JSON.stringify({ items, shipping, paypalOrderId, totalUSD }),
      { maxAge: 60 * 15, httpOnly: true, sameSite: "lax", path: "/" }
    );

    return { approvalUrl };
  } catch {
    return { error: "Error al conectar con PayPal. Intenta de nuevo." };
  }
}

/* ─── PayPal: step 2 — capture + create DB order ────────── */

export async function finalizePayPalOrderAction(
  paypalOrderId: string
): Promise<{ orderId: string } | { error: string }> {
  const jar = await cookies();
  const raw = jar.get("paypal_pending")?.value;
  if (!raw) return { error: "Sesión de pago expirada. Intenta de nuevo desde el carrito." };

  let pending: { items: CheckoutItem[]; shipping: ShippingAddress; paypalOrderId: string; totalUSD: string };
  try {
    pending = JSON.parse(raw);
  } catch {
    return { error: "Datos de pago inválidos." };
  }

  if (pending.paypalOrderId !== paypalOrderId) {
    return { error: "El token de PayPal no coincide con la sesión." };
  }

  try {
    const { status, captureId, capturedAmount } = await capturePayPalOrder(paypalOrderId);
    if (status !== "COMPLETED") {
      return { error: `Pago no completado (estado: ${status}). Intenta de nuevo.` };
    }
    if (Math.abs(parseFloat(capturedAmount) - parseFloat(pending.totalUSD)) > 0.02) {
      console.error(`[PayPal] Amount mismatch: captured=${capturedAmount} expected=${pending.totalUSD}`);
      return { error: "El monto capturado no coincide con el total. Contacta soporte." };
    }

    const result = await insertOrder(
      pending.items,
      pending.shipping,
      "paypal",
      captureId,
      "approved"
    );

    if ("error" in result) return result;

    jar.delete("paypal_pending");
    return { orderId: result.orderId };
  } catch {
    return { error: "Error al capturar el pago de PayPal." };
  }
}
