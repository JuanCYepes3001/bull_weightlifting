import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductFilters, PaginationParams, PaginatedResponse, Product } from "@/types";

export async function getProducts(
  filters: ProductFilters = {},
  pagination: PaginationParams = { page: 1, limit: 12 }
): Promise<PaginatedResponse<Product>> {
  const supabase = await createClient();
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      variants:product_variants(*),
      images:product_images(*)
      `,
      { count: "exact" }
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .order("position", { referencedTable: "product_images", ascending: true })
    .range(offset, offset + limit - 1);

  if (filters.category_id) query = query.eq("category_id", filters.category_id);
  if (filters.gender) query = query.or(`gender.eq.${filters.gender},gender.eq.unisex`);
  if (filters.min_price !== undefined) query = query.gte("price", filters.min_price);
  if (filters.max_price !== undefined) query = query.lte("price", filters.max_price);
  if (filters.on_sale !== undefined) {
    const now = new Date().toISOString();
    query = query
      .eq("is_on_sale", filters.on_sale)
      .or(`sale_start_at.is.null,sale_start_at.lte.${now}`)
      .or(`sale_end_at.is.null,sale_end_at.gte.${now}`);
  }
  if (filters.search) {
    query = query.textSearch("name", filters.search, {
      type: "websearch",
      config: "spanish",
    });
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data as Product[]) ?? [],
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      variants:product_variants(*),
      images:product_images(*)
      `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .order("position", { referencedTable: "product_images", ascending: true })
    .single();

  if (error) return null;
  return data as Product;
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `*, category:categories(*), variants:product_variants(*), images:product_images(*)`
    )
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Product;
}

/** Fetch all active products belonging to the category with the given slug. */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const supabase = await createClient();

  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (!cat) return [];

  const { data, error } = await supabase
    .from("products")
    .select(`*, category:categories(*), variants:product_variants(*), images:product_images(*)`)
    .eq("category_id", cat.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .order("position", { referencedTable: "product_images", ascending: true });

  if (error) throw error;
  return (data as Product[]) ?? [];
}

/**
 * Productos más vendidos para la home. Si aún no hay ventas suficientes se
 * completa con los más recientes y `fromSales` queda en false, para no
 * anunciar como "más vendido" algo que no lo es.
 */
export async function getBestSellingProducts(
  limit = 4
): Promise<{ products: Product[]; fromSales: boolean }> {
  // order_items tiene RLS por usuario: el conteo global solo puede hacerse con
  // el cliente admin, y solo se leen ids y cantidades
  const { data: rows } = await createAdminClient()
    .from("order_items")
    .select("quantity, product_variants(product_id), orders!inner(status)")
    .not("orders.status", "in", "(cancelled,refunded)");

  const units = new Map<string, number>();
  for (const row of (rows ?? []) as unknown as {
    quantity: number;
    product_variants: { product_id: string } | null;
  }[]) {
    const id = row.product_variants?.product_id;
    if (id) units.set(id, (units.get(id) ?? 0) + row.quantity);
  }
  const rankedIds = [...units.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(`*, category:categories(*), variants:product_variants(*), images:product_images(*)`)
    .eq("is_active", true)
    .order("position", { referencedTable: "product_images", ascending: true });

  // Nada agotado en la vitrina de la home
  const inStock = ((data as Product[]) ?? []).filter((p) =>
    p.variants?.some((v) => v.stock > 0)
  );
  const byId = new Map(inStock.map((p) => [p.id, p]));
  const best = rankedIds
    .map((id) => byId.get(id))
    .filter((p): p is Product => !!p)
    .slice(0, limit);

  if (best.length >= limit) return { products: best, fromSales: true };

  // Relleno: solo productos cuya imagen principal existe de verdad en el
  // bucket (hay filas de product_images que apuntan a archivos borrados), y
  // los de catálogo más completo (más fotos) primero
  const { data: files } = await createAdminClient()
    .storage.from("products")
    .list("", { limit: 1000 });
  const stored = new Set((files ?? []).map((f) => f.name));
  const hasStoredImage = (p: Product) => {
    const url = p.images?.[0]?.url;
    const name = url?.split("/object/public/products/")[1];
    return !!name && stored.has(decodeURIComponent(name));
  };

  const taken = new Set(best.map((p) => p.id));
  const fill = inStock
    .filter((p) => !taken.has(p.id) && hasStoredImage(p))
    .sort((a, b) => (b.images?.length ?? 0) - (a.images?.length ?? 0));

  return { products: [...best, ...fill].slice(0, limit), fromSales: false };
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`*, images:product_images(*), variants:product_variants(*)`)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", excludeId)
    .order("position", { referencedTable: "product_images", ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data as Product[]) ?? [];
}
