"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { sendWhatsApp, buildShippedMessage, buildDeliveredMessage } from "@/lib/whatsapp";
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

  // Send notifications after response — after() runs in background
  if (order) {
    const addr = order.shipping_address as Record<string, string> | null;
    const phone = addr?.phone ?? "";
    const isContraEntrega = typeof order.payment_id === "string" &&
      order.payment_id.startsWith("CONTRAENTREGA");
    const capturedOrder = order;
    const capturedStatus = status;

    after(async () => {
      // WhatsApp al cliente solo en shipped y delivered
      if (phone && (capturedStatus === "shipped" || capturedStatus === "delivered")) {
        const message = capturedStatus === "shipped"
          ? buildShippedMessage({ orderId: capturedOrder.id, total: capturedOrder.total, isContraEntrega })
          : buildDeliveredMessage({ orderId: capturedOrder.id, total: capturedOrder.total, isContraEntrega });
        await sendWhatsApp(phone, message);
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
