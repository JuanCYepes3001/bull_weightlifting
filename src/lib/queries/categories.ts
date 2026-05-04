import { createClient } from "@/lib/supabase/server";
import type { Category, Gender } from "@/types";

export async function getCategories(gender?: Gender): Promise<Category[]> {
  const supabase = await createClient();

  let query = supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (gender) query = query.eq("gender", gender);

  const { data: cats, error } = await query;
  if (error) throw error;
  if (!cats?.length) return [];

  // For categories without image_url, use the first product image of that category
  const needsImage = cats.filter((c) => !c.image_url).map((c) => c.id);
  if (needsImage.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("category_id, product_images(url, position)")
      .in("category_id", needsImage)
      .eq("is_active", true);

    const imageMap = new Map<string, string>();
    for (const p of (products ?? []) as Array<{ category_id: string; product_images: Array<{ url: string; position: number }> }>) {
      if (!imageMap.has(p.category_id)) {
        const imgs = [...(p.product_images ?? [])].sort((a, b) => a.position - b.position);
        if (imgs[0]?.url) imageMap.set(p.category_id, imgs[0].url);
      }
    }

    return cats.map((c) => ({
      ...c,
      image_url: c.image_url ?? imageMap.get(c.id) ?? null,
    })) as Category[];
  }

  return cats as Category[];
}

