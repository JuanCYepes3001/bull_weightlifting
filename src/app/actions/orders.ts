"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { sendWhatsApp, buildShippedMessage, buildDeliveredMessage } from "@/lib/whatsapp";
import { sendShippedEmail, sendDeliveredEmail } from "@/lib/email";

type ActionResult = { error?: string; success?: boolean };

const VALID_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export async function updateOrderStatusAction(
  orderId: string,
  status: string
): Promise<ActionResult> {
  if (!VALID_STATUSES.includes(status)) return { error: "Estado inválido" };
  await requireAdmin();
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .update({ status: status as "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("id, user_id, total, payment_id, shipping_address")
    .single();

  if (error) return { error: "Error al actualizar el estado de la orden" };

  // Send notifications on status changes
  if ((status === "shipped" || status === "delivered") && order) {
    const addr = order.shipping_address as Record<string, string> | null;
    const phone = addr?.phone ?? "";
    const isContraEntrega = typeof order.payment_id === "string" &&
      order.payment_id.startsWith("CONTRAENTREGA");

    if (phone) {
      const message = status === "shipped"
        ? buildShippedMessage({ orderId: order.id, total: order.total, isContraEntrega })
        : buildDeliveredMessage({ orderId: order.id, total: order.total, isContraEntrega });
      void sendWhatsApp(phone, message);
    }

    // Get user email via admin client
    if (order.user_id) {
      const adminClient = createAdminClient();
      const { data: { user: orderUser } } = await adminClient.auth.admin.getUserById(order.user_id);
      const email = orderUser?.email;
      if (email) {
        const emailParams = { to: email, orderId: order.id, total: order.total, isContraEntrega };
        void (status === "shipped"
          ? sendShippedEmail(emailParams)
          : sendDeliveredEmail(emailParams));
      }
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/profile/orders");
  revalidatePath(`/profile/orders/${orderId}`);
  return { success: true };
}
