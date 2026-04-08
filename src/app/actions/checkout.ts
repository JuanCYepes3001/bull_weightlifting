"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  address: string;
  city: string;
  department: string;
  notes?: string;
}

export type CheckoutResult = { error: string } | { orderId: string };

export async function createOrderAction(
  items: CheckoutItem[],
  shipping: ShippingAddress,
  paymentMethod: string
): Promise<CheckoutResult> {
  if (!items.length) return { error: "El carrito está vacío" };

  const supabase = await createClient();

  // Require authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión para completar la compra" };

  // Verify stock for each variant
  const variantIds = items.map((i) => i.variantId);
  const { data: variants, error: stockError } = await supabase
    .from("product_variants")
    .select("id, stock")
    .in("id", variantIds);

  if (stockError || !variants) return { error: "Error al verificar disponibilidad" };

  for (const item of items) {
    const v = variants.find((v) => v.id === item.variantId);
    if (!v) return { error: `Variante no encontrada para ${item.productName}` };
    if (v.stock < item.quantity)
      return { error: `Sin stock suficiente para ${item.productName} (${item.size} / ${item.color})` };
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  // Simulate payment — "transferencia" always fails, others succeed
  const paymentStatus = paymentMethod === "transferencia_fallida" ? "failed" : "approved";

  if (paymentStatus === "failed") {
    return { error: "Pago rechazado. Intenta con otro método de pago." };
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "processing",
      total,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shipping_address: shipping as any,
      payment_id: `SIM-${Date.now()}`,
      payment_status: paymentStatus,
      notes: shipping.notes || null,
    })
    .select("id")
    .single();

  if (orderError || !order) return { error: "Error al crear la orden" };

  // Create order items
  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_variant_id: i.variantId,
    quantity: i.quantity,
    unit_price: i.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    // Rollback order
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: "Error al registrar los productos de la orden" };
  }

  // Reduce stock
  for (const item of items) {
    const v = variants.find((v) => v.id === item.variantId)!;
    await supabase
      .from("product_variants")
      .update({ stock: v.stock - item.quantity })
      .eq("id", item.variantId);
  }

  redirect(`/checkout/success?order=${order.id}`);
}
