"use server";

import { createClient } from "@/lib/supabase/server";
import type { LocalCartItem } from "@/store/cartStore";

/** Upsert the user's server cart with the given local items. */
export async function syncCartToServerAction(
  items: LocalCartItem[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  // Find or create cart for this user
  let cartId: string;
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    cartId = existing.id;
  } else {
    const { data: created, error: createErr } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    if (createErr || !created) return { error: createErr?.message };
    cartId = created.id;
  }

  // Replace all cart items
  await supabase.from("cart_items").delete().eq("cart_id", cartId);

  if (items.length > 0) {
    const { error: insertErr } = await supabase.from("cart_items").insert(
      items.map((item) => ({
        cart_id: cartId,
        product_variant_id: item.variantId,
        quantity: item.quantity,
      }))
    );
    if (insertErr) return { error: insertErr.message };
  }

  return {};
}

/** Load the user's server cart, enriched with product display data. */
export async function loadCartFromServerAction(): Promise<{
  items?: LocalCartItem[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart) return { items: [] };

  const { data: rows, error } = await supabase
    .from("cart_items")
    .select(
      `quantity,
       variant:product_variants(
         id, size, color, stock,
         product:products(
           id, name, slug, price, is_on_sale, sale_price,
           images:product_images(url, position)
         )
       )`
    )
    .eq("cart_id", cart.id);

  if (error) return { error: error.message };

  const items: LocalCartItem[] = (rows ?? []).flatMap((row) => {
    const v = row.variant as unknown as {
      id: string;
      size: string;
      color: string;
      stock: number;
      product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        is_on_sale: boolean;
        sale_price: number | null;
        images: { url: string; position: number }[];
      } | null;
    } | null;
    if (!v || !v.product) return [];
    const images = [...(v.product.images ?? [])].sort(
      (a, b) => a.position - b.position
    );
    return [
      {
        variantId: v.id,
        productId: v.product.id,
        productName: v.product.name,
        productSlug: v.product.slug,
        size: v.size,
        color: v.color,
        price: v.product.is_on_sale && v.product.sale_price ? v.product.sale_price : v.product.price,
        imageUrl: images[0]?.url ?? null,
        quantity: row.quantity,
        maxStock: v.stock,
      },
    ];
  });

  return { items };
}
