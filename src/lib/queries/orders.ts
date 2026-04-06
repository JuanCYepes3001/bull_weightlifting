import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/types";

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(
        *,
        variant:product_variants(
          *,
          product:products(id, name, slug, images:product_images(url, alt, position))
        )
      )
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as Order[]) ?? [];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(
        *,
        variant:product_variants(
          *,
          product:products(id, name, slug, images:product_images(url, alt, position))
        )
      )
      `
    )
    .eq("id", orderId)
    .single();

  if (error) return null;
  return data as unknown as Order;
}
