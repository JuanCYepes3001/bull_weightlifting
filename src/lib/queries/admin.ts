import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* ─── Dashboard stats ──────────────────────────────────── */

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  yearlyOrders: number;
  yearlyRevenue: number;
  activeProducts: number;
  pendingOrders: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const yearStart  = new Date(now.getFullYear(), 0, 1).toISOString();

  const [
    ordersRes,
    productsRes,
    pendingRes,
    allRevenueRes,
    monthlyRes,
    yearlyRes,
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("total"),
    supabase.from("orders").select("total").gte("created_at", monthStart),
    supabase.from("orders").select("total").gte("created_at", yearStart),
  ]);

  const sum = (rows: { total: number }[] | null) =>
    (rows ?? []).reduce((acc, o) => acc + (o.total ?? 0), 0);

  return {
    totalOrders:    ordersRes.count ?? 0,
    totalRevenue:   sum(allRevenueRes.data),
    monthlyOrders:  (monthlyRes.data ?? []).length,
    monthlyRevenue: sum(monthlyRes.data),
    yearlyOrders:   (yearlyRes.data ?? []).length,
    yearlyRevenue:  sum(yearlyRes.data),
    activeProducts: productsRes.count ?? 0,
    pendingOrders:  pendingRes.count ?? 0,
  };
}

/* ─── Products ─────────────────────────────────────────── */

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

/* ─── Offers ───────────────────────────────────────────── */

export async function getAdminOffers() {
  const supabase = await createClient();

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

/* ─── Inventory / Low stock ────────────────────────────── */

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
      variantId:   v.id,
      productId:   v.product.id,
      productName: v.product.name,
      size:        v.size,
      color:       v.color,
      stock:       v.stock,
    }));
}

/* ─── Categories ───────────────────────────────────────── */

export async function getAdminCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, gender, image_url, position, created_at")
    .order("position", { ascending: true });

  if (error) return [];
  return data ?? [];
}

/* ─── Activity log ─────────────────────────────────────── */

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
  return (data as unknown as ActivityLogEntry[]) ?? [];
}

/* ─── Orders ───────────────────────────────────────────── */

export interface AdminOrder {
  id: string;
  user_id: string;
  status: string;
  total: number;
  shipping_address: Record<string, string>;
  payment_id: string | null;
  payment_status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer: { name: string | null; phone: string | null } | null;
}

export async function getAdminOrders(status?: string): Promise<AdminOrder[]> {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      "id, user_id, status, total, shipping_address, payment_id, payment_status, notes, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status as "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded");
  }

  const { data: orders, error } = await query;
  if (error) throw error;
  if (!orders?.length) return [];

  // Fetch profiles for customer names/phones (no direct FK, manual join)
  const userIds = [...new Set(orders.map((o) => o.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, name, phone")
    .in("user_id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, { name: p.name, phone: p.phone }])
  );

  return orders.map((o) => ({
    ...o,
    customer: profileMap.get(o.user_id) ?? null,
  })) as AdminOrder[];
}

export interface AdminOrderDetail extends AdminOrder {
  items: {
    id: string;
    quantity: number;
    unit_price: number;
    variant: {
      id: string;
      size: string;
      color: string;
      product: { id: string; name: string; slug: string } | null;
    } | null;
  }[];
}

export async function getAdminOrderById(
  id: string
): Promise<AdminOrderDetail | null> {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, total, shipping_address, payment_id, payment_status, notes, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (error || !order) return null;

  const [itemsRes, profileRes] = await Promise.all([
    supabase
      .from("order_items")
      .select(
        `id, quantity, unit_price,
         variant:product_variants(
           id, size, color,
           product:products(id, name, slug)
         )`
      )
      .eq("order_id", id),
    supabase
      .from("profiles")
      .select("name, phone")
      .eq("user_id", order.user_id)
      .single(),
  ]);

  return {
    ...order,
    customer: profileRes.data
      ? { name: profileRes.data.name, phone: profileRes.data.phone }
      : null,
    items: (itemsRes.data ?? []) as AdminOrderDetail["items"],
  } as AdminOrderDetail;
}

/* ─── Users ────────────────────────────────────────────── */

export interface AdminUser {
  profileId: string;
  user_id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "user" | "admin";
  addresses: Record<string, string>[];
  created_at: string;
  last_sign_in: string | null;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase  = await createClient();
  const adminSupa = createAdminClient();

  const [profilesRes, authRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, user_id, name, phone, role, addresses, created_at")
      .order("created_at", { ascending: false }),
    adminSupa.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const profiles = profilesRes.data ?? [];
  const authUsers = authRes.data?.users ?? [];

  const emailMap = new Map(authUsers.map((u) => [u.id, { email: u.email ?? "", last_sign_in: u.last_sign_in_at ?? null }]));

  return profiles.map((p) => ({
    profileId:    p.id,
    user_id:      p.user_id,
    email:        emailMap.get(p.user_id)?.email ?? "",
    name:         p.name,
    phone:        p.phone,
    role:         p.role as "user" | "admin",
    addresses:    (p.addresses as Record<string, string>[]) ?? [],
    created_at:   p.created_at,
    last_sign_in: emailMap.get(p.user_id)?.last_sign_in ?? null,
  }));
}

/* ─── Daily stats for charts ──────────────────────────── */

export interface DailyStat {
  date: string;   // "YYYY-MM-DD"
  orders: number;
  revenue: number;
}

export async function getDailyStats(days: 7 | 30): Promise<DailyStat[]> {
  const supabase = await createClient();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("orders")
    .select("created_at, total")
    .gte("created_at", cutoff.toISOString());

  // Build a map of day → { orders, revenue }
  const map = new Map<string, { orders: number; revenue: number }>();

  // Pre-fill every day in the range with zeros
  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff);
    d.setDate(cutoff.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { orders: 0, revenue: 0 });
  }

  for (const row of data ?? []) {
    const key = row.created_at.slice(0, 10);
    const entry = map.get(key);
    if (entry) {
      entry.orders += 1;
      entry.revenue += Number(row.total ?? 0);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));
}

/* ─── Weekly stats ────────────────────────────────────── */

export interface WeeklyStat {
  week: string;   // "YYYY-Www" e.g. "2026-W14"
  label: string;  // "Sem 14" — human label
  orders: number;
  revenue: number;
}

export async function getWeeklyStats(weeks = 12): Promise<WeeklyStat[]> {
  const supabase = await createClient();

  const cutoff = new Date();
  // Go back to the start of `weeks` ago (Monday of that week)
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  cutoff.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("orders")
    .select("created_at, total")
    .gte("created_at", cutoff.toISOString());

  const getWeekKey = (d: Date) => {
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
    const year = tmp.getUTCFullYear();
    const week = Math.ceil(((tmp.getTime() - Date.UTC(year, 0, 1)) / 86400000 + 1) / 7);
    return { key: `${year}-W${String(week).padStart(2, "0")}`, weekNum: week };
  };

  // Pre-fill the last `weeks` ISO weeks
  const map = new Map<string, { label: string; orders: number; revenue: number }>();
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const { key, weekNum } = getWeekKey(d);
    if (!map.has(key)) map.set(key, { label: `Sem ${weekNum}`, orders: 0, revenue: 0 });
  }

  for (const row of data ?? []) {
    const { key } = getWeekKey(new Date(row.created_at));
    const entry = map.get(key);
    if (entry) {
      entry.orders += 1;
      entry.revenue += Number(row.total ?? 0);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, v]) => ({ week, ...v }));
}

/* ─── Monthly stats ───────────────────────────────────── */

export interface MonthlyStat {
  month: string;  // "YYYY-MM"
  label: string;  // "Abr 2026"
  orders: number;
  revenue: number;
}

const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export async function getMonthlyStats(months = 12): Promise<MonthlyStat[]> {
  const supabase = await createClient();

  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const { data } = await supabase
    .from("orders")
    .select("created_at, total")
    .gte("created_at", cutoff.toISOString());

  const map = new Map<string, { label: string; orders: number; revenue: number }>();

  // Pre-fill all months
  for (let i = 0; i < months; i++) {
    const d = new Date(cutoff.getFullYear(), cutoff.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, { label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, orders: 0, revenue: 0 });
  }

  for (const row of data ?? []) {
    const d = new Date(row.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = map.get(key);
    if (entry) {
      entry.orders += 1;
      entry.revenue += Number(row.total ?? 0);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }));
}

/* ─── Top products ─────────────────────────────────────── */

export interface TopProduct {
  productId: string;
  productName: string;
  slug: string;
  unitsSold: number;
  revenue: number;
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("order_items")
    .select(`quantity, unit_price, variant:product_variants(product:products(id, name, slug))`);

  if (!data?.length) return [];

  const map = new Map<string, TopProduct>();
  for (const item of data) {
    const product = (item.variant as any)?.product;
    if (!product?.id) continue;
    const existing = map.get(product.id);
    if (existing) {
      existing.unitsSold += item.quantity;
      existing.revenue += item.quantity * item.unit_price;
    } else {
      map.set(product.id, {
        productId: product.id,
        productName: product.name,
        slug: product.slug,
        unitsSold: item.quantity,
        revenue: item.quantity * item.unit_price,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit);
}

/* ─── Order completion stats ───────────────────────────── */

export interface CompletionStats {
  total: number;
  delivered: number;
  cancelled: number;
  completionRate: number; // % of non-cancelled orders (all-time)
}

export async function getOrderCompletionStats(): Promise<CompletionStats> {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("status");
  if (!data?.length) return { total: 0, delivered: 0, cancelled: 0, completionRate: 0 };

  const total = data.length;
  const delivered = data.filter((o) => o.status === "delivered").length;
  const cancelled = data.filter((o) => o.status === "cancelled").length;
  const completionRate = total > 0 ? Math.round(((total - cancelled) / total) * 100) : 0;
  return { total, delivered, cancelled, completionRate };
}
