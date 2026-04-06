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
