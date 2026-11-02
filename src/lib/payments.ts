import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsApp, buildOrderConfirmationMessage } from "@/lib/whatsapp";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { findWompiTransactionsByReference, type WompiTransaction } from "@/lib/wompi";
import { isCustomizableProduct } from "@/lib/customization";

// Wompi orders older than this without a final result are expired and their
// stock released. Must be longer than the checkout link expiration (60 min).
const STALE_AFTER_MS = 90 * 60 * 1000;

type ApplyOutcome = "approved" | "declined" | "amount_mismatch" | "noop" | "not_found";

/**
 * Applies a Wompi transaction (already fetched from Wompi or signature-verified)
 * to its order. Safe to call any number of times for the same transaction.
 */
export async function applyWompiTransaction(tx: WompiTransaction): Promise<ApplyOutcome | "pending"> {
  if (tx.status === "PENDING") return "pending";
  if (tx.currency !== "COP") {
    console.error(`[Wompi] Unexpected currency ${tx.currency} for ${tx.reference}`);
    return "noop";
  }

  const result = tx.status === "APPROVED" ? "approved" : "declined";
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("apply_payment_result", {
    p_payment_id: tx.reference,
    p_result: result,
    p_amount: tx.amount_in_cents / 100,
  });
  if (error) throw new Error(`apply_payment_result failed: ${error.message}`);

  const outcome = data as ApplyOutcome;
  if (outcome === "amount_mismatch") {
    console.error(`[Wompi] Amount mismatch for ${tx.reference} (tx ${tx.id})`);
  }
  if (outcome === "approved") {
    await notifyPaidOrder(tx.reference);
  }
  return outcome;
}

/** Confirmation email + WhatsApp once the payment is actually approved. */
async function notifyPaidOrder(paymentId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, user_id, total, shipping_address, order_items(quantity, unit_price, product_variants(size, color, products(name, slug)))")
    .eq("payment_id", paymentId)
    .single();
  if (!order) return;

  type Row = {
    quantity: number;
    unit_price: number;
    product_variants: {
      size: string;
      color: string;
      products: { name: string; slug: string } | null;
    } | null;
  };
  const rows = (order.order_items ?? []) as unknown as Row[];
  const needsCustomization = rows.some((r) =>
    isCustomizableProduct(r.product_variants?.products?.slug)
  );
  const items = rows.map((r) => ({
    productName: r.product_variants?.products?.name ?? "Producto",
    size: r.product_variants?.size ?? "",
    color: r.product_variants?.color ?? "",
    quantity: r.quantity,
    price: Number(r.unit_price),
  }));
  const shipping = order.shipping_address as unknown as {
    full_name: string; phone: string; city: string; state: string; address: string;
  };
  const total = Number(order.total);

  try {
    if (shipping?.phone) {
      await sendWhatsApp(
        shipping.phone,
        buildOrderConfirmationMessage({ orderId: order.id, items, total, paymentMethod: "wompi", shipping, needsCustomization })
      );
    }
    if (order.user_id) {
      const { data: { user } } = await supabase.auth.admin.getUserById(order.user_id);
      if (user?.email) {
        await sendOrderConfirmationEmail({
          to: user.email, orderId: order.id, items, total, paymentMethod: "wompi", shipping,
        });
      }
    }
  } catch (err) {
    // A failed notification must never undo or retry a confirmed payment
    console.error("[Wompi] Notification failed:", err);
  }
}

/**
 * Resolves Wompi orders stuck in "wompi_pending" (customer closed the tab,
 * webhook lost…). Asks Wompi for the real result; only when Wompi confirms
 * there is no approved/pending transaction is the order cancelled and its
 * stock released.
 */
export async function expireStaleWompiOrders(): Promise<{ checked: number; expired: number }> {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - STALE_AFTER_MS).toISOString();
  const { data: stale } = await supabase
    .from("orders")
    .select("payment_id")
    .eq("payment_status", "wompi_pending")
    .lt("created_at", cutoff)
    .limit(25);

  let expired = 0;
  for (const row of stale ?? []) {
    const reference = row.payment_id;
    if (!reference) continue;
    const txs = await findWompiTransactionsByReference(reference);
    if (txs === null) continue; // could not ask Wompi → leave untouched

    const approved = txs.find((t) => t.status === "APPROVED");
    if (approved) {
      await applyWompiTransaction(approved);
      continue;
    }
    if (txs.some((t) => t.status === "PENDING")) continue;

    const { data } = await supabase.rpc("apply_payment_result", {
      p_payment_id: reference,
      p_result: "declined",
      p_amount: null,
    });
    if (data === "declined") expired++;
  }
  return { checked: stale?.length ?? 0, expired };
}
