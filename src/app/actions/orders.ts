"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

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

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { error: "Error al actualizar el estado de la orden" };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
