"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import {
  sendWhatsApp,
  buildStatusUpdateMessage,
  buildOrderConfirmationMessage,
  MANUAL_PAYMENT_METHODS,
} from "@/lib/whatsapp";
import { isCustomizableProduct } from "@/lib/customization";
import {
  sendShippedEmail,
  sendDeliveredEmail,
  sendProcessingEmail,
  sendCancelledEmail,
  sendRefundedEmail,
} from "@/lib/email";

type ActionResult = { error?: string; success?: boolean };

const VALID_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

type ItemRow = {
  quantity: number;
  unit_price: number;
  product_variants: {
    size: string;
    color: string;
    products: { name: string; slug: string } | null;
  } | null;
};

// Manual transfers are verified by the admin moving the order from "pending"
// to "processing": that is the moment the customer has actually paid, so the
// customization request goes out then (not at checkout, like other methods).
async function buildManualPaymentCustomizationMessage(
  orderId: string,
  paymentMethod: string,
  total: number,
  addr: Record<string, string>
) {
  const { data } = await createAdminClient()
    .from("order_items")
    .select("quantity, unit_price, product_variants(size, color, products(name, slug))")
    .eq("order_id", orderId);
  const rows = (data ?? []) as unknown as ItemRow[];
  if (!rows.some((r) => isCustomizableProduct(r.product_variants?.products?.slug))) return null;

  return buildOrderConfirmationMessage({
    orderId,
    items: rows.map((r) => ({
      productName: r.product_variants?.products?.name ?? "Producto",
      size: r.product_variants?.size ?? "",
      color: r.product_variants?.color ?? "",
      quantity: r.quantity,
      price: r.unit_price,
    })),
    total,
    paymentMethod,
    shipping: {
      full_name: addr.full_name ?? "",
      address: addr.address ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
    },
    needsCustomization: true,
    paymentConfirmed: true,
  });
}

export async function updateOrderStatusAction(
  orderId: string,
  status: string
): Promise<ActionResult> {
  if (!VALID_STATUSES.includes(status)) return { error: "Estado inválido" };
  await requireAdmin();
  const supabase = await createClient();

  const { data: previous } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  const { data: order, error } = await supabase
    .from("orders")
    .update({ status: status as "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("id, user_id, total, payment_id, shipping_address")
    .single();

  if (error) return { error: "Error al actualizar el estado de la orden" };

  // Send notifications after response — after() runs in background
  if (order) {
    const addr = order.shipping_address as Record<string, string> | null;
    const phone = addr?.phone ?? "";
    const isContraEntrega = typeof order.payment_id === "string" &&
      order.payment_id.startsWith("CONTRAENTREGA");
    const capturedOrder = order;
    const capturedStatus = status;
    const paymentMethod =
      typeof order.payment_id === "string"
        ? order.payment_id.replace(/-\d+$/, "").toLowerCase()
        : "";
    const isManualPaymentVerified =
      MANUAL_PAYMENT_METHODS.has(paymentMethod) &&
      previous?.status === "pending" &&
      status === "processing";

    after(async () => {
      // WhatsApp al cliente en cada avance del pedido (al mismo número del checkout)
      if (phone) {
        const customizationMessage =
          isManualPaymentVerified && addr
            ? await buildManualPaymentCustomizationMessage(
                capturedOrder.id, paymentMethod, capturedOrder.total, addr
              )
            : null;
        const message = customizationMessage ?? buildStatusUpdateMessage({
          orderId: capturedOrder.id,
          status: capturedStatus,
          customerName: addr?.full_name ?? "",
          total: capturedOrder.total,
          isContraEntrega,
        });
        if (message) await sendWhatsApp(phone, message);
      }

      // Email al cliente en todos los cambios de estado relevantes
      if (capturedOrder.user_id) {
        const adminClient = createAdminClient();
        const { data: { user: orderUser } } = await adminClient.auth.admin.getUserById(capturedOrder.user_id);
        const email = orderUser?.email;
        if (email) {
          const base = { to: email, orderId: capturedOrder.id, total: capturedOrder.total };
          if (capturedStatus === "processing") await sendProcessingEmail({ to: email, orderId: capturedOrder.id });
          else if (capturedStatus === "shipped") await sendShippedEmail({ ...base, isContraEntrega });
          else if (capturedStatus === "delivered") await sendDeliveredEmail({ ...base, isContraEntrega });
          else if (capturedStatus === "cancelled") await sendCancelledEmail(base);
          else if (capturedStatus === "refunded") await sendRefundedEmail(base);
        }
      }
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/profile/orders");
  revalidatePath(`/profile/orders/${orderId}`);
  return { success: true };
}
