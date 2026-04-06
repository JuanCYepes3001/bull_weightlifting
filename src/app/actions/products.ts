"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

type ActionResult = { error?: string; success?: boolean; id?: string };

const productSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Precio debe ser mayor a 0"),
  category_id: z.string().uuid("Categoría requerida"),
  is_active: z.coerce.boolean().default(true),
  is_on_sale: z.coerce.boolean().default(false),
  sale_price: z.coerce.number().nullable().optional(),
  discount_percent: z.coerce.number().min(0).max(100).nullable().optional(),
});

export async function createProductAction(
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    category_id: formData.get("category_id"),
    is_active: formData.get("is_active") === "true",
    is_on_sale: formData.get("is_on_sale") === "true",
    sale_price: formData.get("sale_price") ? Number(formData.get("sale_price")) : null,
    discount_percent: formData.get("discount_percent") ? Number(formData.get("discount_percent")) : null,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert(parsed.data)
    .select("id")
    .single();

  if (productError) {
    if (productError.code === "23505")
      return { error: "Ya existe un producto con ese slug" };
    return { error: "Error al crear el producto" };
  }

  // Variants
  const variantCount = parseInt(formData.get("variant_count") as string) || 0;
  if (variantCount > 0) {
    const variants = Array.from({ length: variantCount }, (_, i) => ({
      product_id: product.id,
      size: formData.get(`variant_size_${i}`) as string,
      color: formData.get(`variant_color_${i}`) as string,
      color_hex: (formData.get(`variant_color_hex_${i}`) as string) || null,
      stock: parseInt(formData.get(`variant_stock_${i}`) as string) || 0,
      sku: (formData.get(`variant_sku_${i}`) as string) || null,
    })).filter((v) => v.size && v.color);

    if (variants.length > 0) {
      await supabase.from("product_variants").insert(variants);
    }
  }

  // Images
  const imageCount = parseInt(formData.get("image_count") as string) || 0;
  if (imageCount > 0) {
    const images = Array.from({ length: imageCount }, (_, i) => ({
      product_id: product.id,
      url: formData.get(`image_url_${i}`) as string,
      alt: (formData.get(`image_alt_${i}`) as string) || null,
      position: i,
    })).filter((img) => img.url);

    if (images.length > 0) {
      await supabase.from("product_images").insert(images);
    }
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    category_id: formData.get("category_id"),
    is_active: formData.get("is_active") === "true",
    is_on_sale: formData.get("is_on_sale") === "true",
    sale_price: formData.get("sale_price") ? Number(formData.get("sale_price")) : null,
    discount_percent: formData.get("discount_percent") ? Number(formData.get("discount_percent")) : null,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: "Error al actualizar el producto" };

  revalidatePath("/admin/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  return { success: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: "Error al eliminar el producto" };

  revalidatePath("/admin/products");
  return { success: true };
}

export async function toggleProductActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: "Error al actualizar estado" };

  revalidatePath("/admin/products");
  return { success: true };
}
