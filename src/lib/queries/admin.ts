import { createClient } from "@/lib/supabase/server";

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  pendingOrders: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [ordersRes, productsRes, pendingRes, revenueRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("orders").select("total"),
  ]);

  const totalRevenue = (revenueRes.data ?? []).reduce(
    (sum: number, o: { total: number }) => sum + (o.total ?? 0),
    0
  );

  return {
    totalOrders: ordersRes.count ?? 0,
    totalRevenue,
    activeProducts: productsRes.count ?? 0,
    pendingOrders: pendingRes.count ?? 0,
  };
}

export async function getAdminProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `*, category:categories(name, slug), variants:product_variants(*), images:product_images(*)`
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAdminOffers() {
  const supabase = await createClient();
  
  // Ejecutar limpieza antes de consultar
  await supabase.rpc("expire_products_offers" as any);

  const { data, error } = await supabase
    .from("products")
    .select(
      `*, category:categories(name, slug), variants:product_variants(*), images:product_images(*)`
    )
    .eq("is_on_sale", true)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
export interface LowStockVariant {
  variantId: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  stock: number;
}

export async function getLowStockProducts(threshold = 10): Promise<LowStockVariant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(`id, size, color, stock, product:products(id, name, is_active)`)
    .lte("stock", threshold)
    .order("stock", { ascending: true });

  if (error) return [];

  return (data ?? [])
    .filter((v: any) => v.product?.is_active)
    .map((v: any) => ({
      variantId: v.id,
      productId: v.product.id,
      productName: v.product.name,
      size: v.size,
      color: v.color,
      stock: v.stock,
    }));
}

export interface ActivityLogEntry {
  id: string;
  admin_name: string;
  action: string;
  entity_name: string | null;
  entity_type: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export async function getRecentActivity(limit = 15): Promise<ActivityLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as ActivityLogEntry[]) ?? [];
}

export async function getProductByIdAdmin(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `*, category:categories(*), variants:product_variants(*), images:product_images(*)`
    )
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
