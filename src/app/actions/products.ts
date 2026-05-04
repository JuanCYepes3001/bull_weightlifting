"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/* ─── Activity log helper ──────────────────────────────── */
async function logActivity(
  adminId: string,
  adminName: string,
  action: string,
  entityName: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  try {
    const supabase = await createClient();
    await supabase.from("admin_activity_log").insert({
      admin_id: adminId,
      admin_name: adminName,
      action,
      entity_type: "product",
      entity_id: entityId ?? null,
      entity_name: entityName,
      details: (details ?? null) as import("@/types/database").Json | null,
    });
  } catch {
    // Non-critical — don't fail the main action if logging fails
  }
}

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
  gender: z.enum(["hombre", "mujer", "unisex"]).default("unisex"),
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
  const { profile: adminProfile } = await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    category_id: formData.get("category_id"),
    gender: formData.get("gender") || "unisex",
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
      const { error: variantsError } = await supabase.from("product_variants").insert(variants);
      if (variantsError) return { error: `Error al guardar variantes: ${variantsError.message}` };
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

  await logActivity(adminProfile.user_id, adminProfile.name ?? "Admin", "product_created", parsed.data.name, product.id);

  revalidatePath("/admin/products");
  redirect("/admin/products?saved=true");
}

export async function updateProductAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const { profile: adminProfile } = await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    category_id: formData.get("category_id"),
    gender: formData.get("gender") || "unisex",
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

  // Delete + reinsert variants
  await supabase.from("product_variants").delete().eq("product_id", id);
  const variantCount = parseInt(formData.get("variant_count") as string) || 0;
  if (variantCount > 0) {
    const variants = Array.from({ length: variantCount }, (_, i) => ({
      product_id: id,
      size: formData.get(`variant_size_${i}`) as string,
      color: formData.get(`variant_color_${i}`) as string,
      color_hex: (formData.get(`variant_color_hex_${i}`) as string) || null,
      stock: parseInt(formData.get(`variant_stock_${i}`) as string) || 0,
      sku: (formData.get(`variant_sku_${i}`) as string) || null,
    })).filter((v) => v.size && v.color);

    if (variants.length > 0) {
      const { error: variantsError } = await supabase.from("product_variants").insert(variants);
      if (variantsError) return { error: `Error al guardar variantes: ${variantsError.message}` };
    }
  }

  // Delete + reinsert images
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

  await logActivity(adminProfile.user_id, adminProfile.name ?? "Admin", "product_updated", parsed.data.name, id);

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath(`/products/${parsed.data.slug}`);
  redirect("/admin/products?saved=true");
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = await createClient();

  // Grab name before deletion for the log
  const { data: prod } = await supabase.from("products").select("name").eq("id", id).single();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: "Error al eliminar el producto" };

  await logActivity(adminProfile.user_id, adminProfile.name ?? "Admin", "product_deleted", prod?.name ?? id);

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  return { success: true };
}

export async function bulkDeleteProductsAction(ids: string[]): Promise<ActionResult> {
  if (!ids.length) return { error: "Nada seleccionado" };
  const { profile: adminProfile } = await requireAdmin();
  const supabase = await createClient();

  const { data: prods } = await supabase.from("products").select("name").in("id", ids);
  const { error } = await supabase.from("products").delete().in("id", ids);
  if (error) return { error: "Error al eliminar productos" };

  const names = (prods ?? []).map((p: any) => p.name).join(", ");
  await logActivity(adminProfile.user_id, adminProfile.name ?? "Admin", "bulk_deleted", names, undefined, { count: ids.length });

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
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

/* ─── Bulk create ─────────────────────────────────────── */

export interface BulkProductInput {
  name: string;
  price: number;
  category_id: string;
  description?: string;
  sizes: string[];       // e.g. ["S","M","L"]
  colors: string[];      // e.g. ["Negro","Blanco"]
  stock: number;         // applied to all generated variants
}

export async function bulkCreateProductsAction(
  inputs: BulkProductInput[]
): Promise<ActionResult & { created?: number; errors?: string[] }> {
  if (!inputs.length) return { error: "Sin productos para crear" };
  const { profile: adminProfile } = await requireAdmin();
  const supabase = await createClient();

  let created = 0;
  const errors: string[] = [];

  for (const input of inputs) {
    if (!input.name || !input.price || !input.category_id) {
      errors.push(`"${input.name || "sin nombre"}": faltan campos requeridos`);
      continue;
    }

    const slug = input.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") + `-${Date.now().toString(36)}`;

    const { data: product, error: prodError } = await supabase
      .from("products")
      .insert({
        name: input.name,
        slug,
        description: input.description || null,
        price: input.price,
        category_id: input.category_id,
        is_active: true,
      })
      .select("id")
      .single();

    if (prodError) {
      errors.push(`"${input.name}": ${prodError.message}`);
      continue;
    }

    // Generate variants from sizes × colors
    if (input.sizes.length > 0 && input.colors.length > 0) {
      const variants = input.sizes.flatMap((size) =>
        input.colors.map((color) => ({
          product_id: product.id,
          size,
          color,
          stock: input.stock,
        }))
      );
      await supabase.from("product_variants").insert(variants);
    }

    created++;
  }

  if (created > 0) {
    await logActivity(
      adminProfile.user_id,
      adminProfile.name ?? "Admin",
      "product_created",
      `${created} productos (carga masiva)`,
      undefined,
      { count: created }
    );
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
  }

  return { success: true, created, errors: errors.length ? errors : undefined };
}

/* ─── Category actions ─────────────────────────────────── */

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  const { profile: adminProfile } = await requireAdmin();

  const name   = (formData.get("name") as string)?.trim();
  const gender = formData.get("gender") as string;

  if (!name) return { error: "Nombre requerido" };
  if (!["hombre", "mujer", "unisex"].includes(gender))
    return { error: "Género inválido" };

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .insert({ name, slug, gender: gender as "hombre" | "mujer" | "unisex" });

  if (error) {
    if (error.code === "23505")
      return { error: "Ya existe una categoría con ese nombre" };
    return { error: "Error al crear la categoría" };
  }

  await logActivity(adminProfile.user_id, adminProfile.name ?? "Admin", "category_created", name);

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
  revalidatePath("/admin/dashboard");
  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = await createClient();

  // Prevent deleting a category that still has products
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if ((count ?? 0) > 0)
    return { error: `No se puede eliminar: tiene ${count} producto(s) asignado(s)` };

  const { data: cat } = await supabase.from("categories").select("name").eq("id", id).single();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: "Error al eliminar la categoría" };

  await logActivity(adminProfile.user_id, adminProfile.name ?? "Admin", "category_deleted", cat?.name ?? id);

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
  revalidatePath("/");
  return { success: true };
}

/* ─── Inventory actions ────────────────────────────────── */

export async function updateVariantStockAction(
  variantId: string,
  stock: number
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .update({ stock })
    .eq("id", variantId);

  if (error) return { error: "Error al actualizar stock" };

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteVariantAction(variantId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error) return { error: "Error al eliminar variante" };

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function addVariantToProductAction(
  productId: string,
  data: { size: string; color: string; color_hex: string; stock: number; sku?: string }
): Promise<ActionResult & { id?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: inserted, error } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      size: data.size,
      color: data.color,
      color_hex: data.color_hex || null,
      stock: data.stock,
      sku: data.sku || null,
    })
    .select("id")
    .single();

  if (error) return { error: "Error al agregar variante" };

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { success: true, id: inserted.id };
}

