import { createClient } from "@/lib/supabase/server";
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
    .limit(limit);

  if (error) throw error;
  return (data as Product[]) ?? [];
}
