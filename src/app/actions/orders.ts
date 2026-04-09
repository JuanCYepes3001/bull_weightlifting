"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { sendWhatsApp, buildShippedMessage } from "@/lib/whatsapp";

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
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("id, total, payment_id, shipping_address")
    .single();

  if (error) return { error: "Error al actualizar el estado de la orden" };

  // Send WhatsApp notification when order ships
  if (status === "shipped" && order) {
    const addr = order.shipping_address as Record<string, string> | null;
    const phone = addr?.phone ?? "";
    if (phone) {
      const isContraEntrega = typeof order.payment_id === "string" &&
        order.payment_id.startsWith("CONTRAENTREGA");
      void sendWhatsApp(
        phone,
        buildShippedMessage({
          orderId: order.id,
          total: order.total,
          isContraEntrega,
        })
      );
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
