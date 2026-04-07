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
  sale_start_at: z.string().nullable().optional(),
  sale_end_at: z.string().nullable().optional(),
});

export async function createProductAction(
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    category_id: formData.get("category_id"),
    is_active: formData.get("is_active") === "true",
    is_on_sale: formData.get("is_on_sale") === "true",
    sale_price: formData.get("sale_price") && formData.get("sale_price") !== "" ? Number(formData.get("sale_price")) : null,
    discount_percent: formData.get("discount_percent") && formData.get("discount_percent") !== "" ? Number(formData.get("discount_percent")) : null,
    sale_start_at: (formData.get("sale_start_at") as string) || null,
    sale_end_at: (formData.get("sale_end_at") as string) || null,
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
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    category_id: formData.get("category_id"),
    is_active: formData.get("is_active") === "true",
    is_on_sale: formData.get("is_on_sale") === "true",
    sale_price: formData.get("sale_price") && formData.get("sale_price") !== "" ? Number(formData.get("sale_price")) : null,
    discount_percent: formData.get("discount_percent") && formData.get("discount_percent") !== "" ? Number(formData.get("discount_percent")) : null,
    sale_start_at: (formData.get("sale_start_at") as string) || null,
    sale_end_at: (formData.get("sale_end_at") as string) || null,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: "Error al actualizar el producto" };

  // Variantes: actualizar existentes, insertar nuevas, borrar eliminadas
  const variantCount = parseInt(formData.get("variant_count") as string) || 0;
  const submittedVariants = Array.from({ length: variantCount }, (_, i) => ({
    id: (formData.get(`variant_id_${i}`) as string) || null,
    product_id: id,
    size: formData.get(`variant_size_${i}`) as string,
    color: formData.get(`variant_color_${i}`) as string,
    color_hex: (formData.get(`variant_color_hex_${i}`) as string) || null,
    stock: parseInt(formData.get(`variant_stock_${i}`) as string) || 0,
    sku: (formData.get(`variant_sku_${i}`) as string) || null,
  })).filter((v) => v.size && v.color);

  const { data: existingVariants } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", id);

  const existingIds = new Set((existingVariants ?? []).map((v) => v.id));
  const submittedIds = new Set(submittedVariants.filter((v) => v.id).map((v) => v.id!));

  // Borrar solo las que ya no están en el formulario
  const idsToDelete = [...existingIds].filter((vid) => !submittedIds.has(vid));
  if (idsToDelete.length > 0) {
    await supabase.from("product_variants").delete().in("id", idsToDelete);
  }

  // Actualizar las existentes
  for (const v of submittedVariants.filter((v) => v.id && existingIds.has(v.id))) {
    await supabase
      .from("product_variants")
      .update({ size: v.size, color: v.color, color_hex: v.color_hex, stock: v.stock, sku: v.sku || null })
      .eq("id", v.id!);
  }

  // Insertar las nuevas (sin ID)
  const toInsert = submittedVariants
    .filter((v) => !v.id)
    .map(({ id: _id, ...rest }) => rest);
  if (toInsert.length > 0) {
    await supabase.from("product_variants").insert(toInsert);
  }

  // Imágenes: borrar y reinsertar
  await supabase.from("product_images").delete().eq("product_id", id);
  const imageCount = parseInt(formData.get("image_count") as string) || 0;
  if (imageCount > 0) {
    const images = Array.from({ length: imageCount }, (_, i) => ({
      product_id: id,
      url: formData.get(`image_url_${i}`) as string,
      alt: (formData.get(`image_alt_${i}`) as string) || null,
      position: i,
    })).filter((img) => img.url);

    if (images.length > 0) {
      await supabase.from("product_images").insert(images);
    }
  }

  revalidatePath("/admin/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath("/products");
  redirect("/admin/products");
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

export async function bulkUpdateOffersAction(
  productIds: string[],
  discountPercent: number,
  startDate: string,
  endDate: string
): Promise<ActionResult> {
  await requireAdmin();
  if (!productIds.length) return { error: "No hay productos seleccionados" };
  
  const supabase = await createClient();

  // 1. Obtener precios actuales
  const { data: products, error: fetchError } = await supabase
    .from("products")
    .select("id, price")
    .in("id", productIds);

  if (fetchError || !products) return { error: "Error al obtener productos" };

  // 2. Preparar actualizaciones
  const updates = products.map((p) => {
    const rawSalePrice = p.price * (1 - discountPercent / 100);
    const niceSalePrice = Math.round(rawSalePrice / 100) * 100;
    
    return {
      id: p.id,
      is_on_sale: true,
      discount_percent: discountPercent,
      sale_price: niceSalePrice,
      sale_start_at: startDate || null,
      sale_end_at: endDate || null,
      updated_at: new Date().toISOString(),
    };
  });

  // 3. Ejecutar actualizaciones uno a uno para evitar errores de campos obligatorios en UPSERT
  const updatePromises = updates.map(update => 
    supabase
      .from("products")
      .update({
        is_on_sale: update.is_on_sale,
        discount_percent: update.discount_percent,
        sale_price: update.sale_price,
        sale_start_at: update.sale_start_at,
        sale_end_at: update.sale_end_at,
        updated_at: update.updated_at
      })
      .eq("id", update.id)
  );

  const results = await Promise.all(updatePromises);
  const findError = results.find(r => r.error);

  if (findError) {
    console.error("Error en actualización masiva:", findError.error);
    return { error: "Error al aplicar ofertas en uno o más productos" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/offers");
  revalidatePath("/products");
  
  return { success: true };
}

