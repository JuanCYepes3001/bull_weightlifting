import { getAdminStats, getLowStockProducts, getRecentActivity, getDailyStats, getTopProducts, getOrderCompletionStats } from "@/lib/queries/admin";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  AlertTriangle,
  Activity,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import ReportDownloader from "./ReportDownloader";
import { SalesChart } from "./SalesChart";
import { TopProductsWidget } from "./TopProductsWidget";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Admin" };

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  product_created: { label: "Producto creado",    color: "text-green-400" },
  product_updated: { label: "Producto editado",   color: "text-blue-400" },
  product_deleted: { label: "Producto eliminado", color: "text-red-400" },
  bulk_deleted:    { label: "Eliminación masiva", color: "text-red-400" },
  stock_updated:   { label: "Stock actualizado",  color: "text-amber-400" },
  offer_applied:   { label: "Oferta aplicada",    color: "text-crimson" },
  variant_added:   { label: "Variante agregada",  color: "text-green-400" },
  variant_deleted: { label: "Variante eliminada", color: "text-red-400" },
  category_created:{ label: "Categoría creada",   color: "text-purple-400" },
  order_updated:   { label: "Orden actualizada",  color: "text-blue-400" },
  role_updated:    { label: "Rol actualizado",    color: "text-amber-400" },
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const min  = Math.floor(diff / 60000);
  const hr   = Math.floor(min / 60);
  const day  = Math.floor(hr / 24);
  if (day > 0) return `hace ${day}d`;
  if (hr  > 0) return `hace ${hr}h`;
  if (min > 0) return `hace ${min}m`;
  return "ahora";
}

const COP = (n: number) =>
  "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 });

export default async function AdminDashboardPage() {
  const [stats, lowStock, activity, daily7, daily30, topProducts, completion] = await Promise.all([
    getAdminStats().catch(() => ({
      totalOrders: 0, totalRevenue: 0,
      monthlyOrders: 0, monthlyRevenue: 0,
      yearlyOrders: 0, yearlyRevenue: 0,
      activeProducts: 0, pendingOrders: 0,
    })),
    getLowStockProducts(10).catch(() => []),
    getRecentActivity(15).catch(() => []),
    getDailyStats(7).catch(() => []),
    getDailyStats(30).catch(() => []),
    getTopProducts(5).catch(() => []),
    getOrderCompletionStats().catch(() => ({ total: 0, delivered: 0, cancelled: 0, completionRate: 0 })),
  ]);

  const now    = new Date();
  const month  = now.toLocaleString("es-CO", { month: "long" });
  const year   = now.getFullYear();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
          Panel de Control
        </p>
        <h1 className="text-2xl text-white">DASHBOARD</h1>
      </div>

      {/* Low stock alert banner */}
      {lowStock.length > 0 && (
        <div className="border border-amber-500/25 bg-amber-500/5 px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
            <p className="font-body text-xs tracking-widest uppercase text-amber-400">
              {lowStock.length} variante{lowStock.length !== 1 ? "s" : ""} con stock ≤ 10 unidades
            </p>
            <Link
              href="/admin/inventory"
              className="ml-auto font-body text-[9px] tracking-widest uppercase text-amber-400/60 hover:text-amber-400 transition-colors underline underline-offset-2"
            >
              Gestionar →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.slice(0, 8).map((v) => (
              <div
                key={v.variantId}
                className={`flex items-center gap-1.5 px-2 py-1 border font-body text-[9px] tracking-wide ${
                  v.stock === 0
                    ? "border-red-500/25 bg-red-500/5 text-red-400"
                    : "border-amber-500/20 bg-amber-500/5 text-amber-400/80"
                }`}
              >
                <span className="font-horizon text-[9px]">{v.productName}</span>
                <span className="text-white/30">·</span>
                <span>{v.color} {v.size}</span>
                <span className={`ml-1 font-bold ${v.stock === 0 ? "text-red-400" : "text-amber-400"}`}>
                  {v.stock === 0 ? "SIN STOCK" : `${v.stock} uds`}
                </span>
              </div>
            ))}
            {lowStock.length > 8 && (
              <span className="font-body text-[9px] text-white/30 px-2 py-1">
                +{lowStock.length - 8} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* Monthly metrics */}
      <div>
        <p className="font-body text-[9px] tracking-[0.35em] uppercase text-white/25 mb-3 flex items-center gap-2">
          <Calendar size={10} className="text-white/25" />
          {month.charAt(0).toUpperCase() + month.slice(1)} {year}
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Monthly orders */}
          <div className="border border-blue-400/10 bg-blue-400/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-white/40">
                Órdenes del Mes
              </p>
              <ShoppingCart size={13} className="text-blue-400" />
            </div>
            <p className="font-bebas text-3xl tracking-wider text-blue-400">
              {stats.monthlyOrders}
            </p>
          </div>

          {/* Monthly revenue */}
          <div className="border border-crimson/10 bg-crimson/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-white/40">
                Ingresos del Mes
              </p>
              <DollarSign size={13} className="text-crimson" />
            </div>
            <div>
              <p className="font-bebas text-3xl tracking-wider text-crimson">
                {COP(stats.monthlyRevenue)}
              </p>
              <p className="font-body text-[10px] text-white/20">COP</p>
            </div>
          </div>

          {/* Active products */}
          <div className="border border-green-400/10 bg-green-400/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-white/40">
                Productos Activos
              </p>
              <Package size={13} className="text-green-400" />
            </div>
            <p className="font-bebas text-3xl tracking-wider text-green-400">
              {stats.activeProducts}
            </p>
          </div>

          {/* Pending orders — clickable */}
          <Link
            href="/admin/orders?status=pending"
            className="border border-yellow-400/10 bg-yellow-400/5 p-5 space-y-3 hover:border-yellow-400/30 hover:bg-yellow-400/10 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-white/40 group-hover:text-white/60 transition-colors">
                Pendientes por despachar
              </p>
              <Clock size={13} className="text-yellow-400" />
            </div>
            <div className="flex items-end justify-between">
              <p className="font-bebas text-3xl tracking-wider text-yellow-400">
                {stats.pendingOrders}
              </p>
              <span className="font-body text-[9px] tracking-widest uppercase text-yellow-400/40 group-hover:text-yellow-400/80 transition-colors mb-1">
                Ver →
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Yearly metrics */}
      <div>
        <p className="font-body text-[9px] tracking-[0.35em] uppercase text-white/25 mb-3 flex items-center gap-2">
          <TrendingUp size={10} className="text-white/25" />
          Acumulado {year}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-blue-400/5 bg-white/[0.02] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-white/40">
                Órdenes del Año
              </p>
              <ShoppingCart size={13} className="text-white/25" />
            </div>
            <p className="font-bebas text-3xl tracking-wider text-white/70">
              {stats.yearlyOrders}
            </p>
          </div>
          <div className="border border-white/5 bg-white/[0.02] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-white/40">
                Ingresos del Año
              </p>
              <DollarSign size={13} className="text-white/25" />
            </div>
            <div>
              <p className="font-bebas text-3xl tracking-wider text-white/70">
                {COP(stats.yearlyRevenue)}
              </p>
              <p className="font-body text-[10px] text-white/20">COP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales trend chart */}
      <SalesChart data7={daily7} data30={daily30} />

      {/* Top products + completion rate */}
      <TopProductsWidget products={topProducts} completion={completion} />

      {/* Report downloader */}
      <ReportDownloader />

      {/* Two-column: quick actions + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="border border-white/5 p-6 space-y-4">
          <h2 className="font-body text-[10px] tracking-[0.3em] text-white/40 uppercase">
            Acciones rápidas
          </h2>
          <div className="flex flex-col gap-2">
            <a href="/admin/products/new"  className="font-body text-xs tracking-widest uppercase px-4 py-2.5 bg-crimson hover:bg-crimson-light text-white transition-colors text-center">
              + Nuevo producto
            </a>
            <a href="/admin/products/bulk" className="font-body text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-colors text-center">
              Carga masiva
            </a>
            <a href="/admin/inventory"     className="font-body text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-colors text-center">
              Gestionar inventario
            </a>
            <a href="/admin/offers"        className="font-body text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-colors text-center">
              Gestionar ofertas
            </a>
            <a href="/admin/orders"        className="font-body text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-colors text-center">
              Ver órdenes
            </a>
          </div>
        </div>

        {/* Activity log */}
        <div className="lg:col-span-2 border border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-white/30" />
            <h2 className="font-body text-[10px] tracking-[0.3em] text-white/40 uppercase">
              Actividad reciente
            </h2>
          </div>

          {activity.length === 0 ? (
            <p className="font-body text-xs text-white/20 py-4 text-center">
              Sin actividad registrada. Las acciones aparecerán aquí.
            </p>
          ) : (
            <div className="space-y-0 divide-y divide-white/[0.04]">
              {activity.map((entry) => {
                const meta = ACTION_LABELS[entry.action] ?? {
                  label: entry.action,
                  color: "text-white/50",
                };
                return (
                  <div key={entry.id} className="flex items-start gap-4 py-3">
                    <span className={`font-body text-[9px] tracking-widest uppercase shrink-0 w-36 ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="font-body text-xs text-white/60 flex-1 truncate">
                      {entry.entity_name ?? "—"}
                    </span>
                    <div className="flex flex-col items-end shrink-0 gap-0.5">
                      <span className="font-body text-[9px] text-white/30">
                        {entry.admin_name}
                      </span>
                      <span className="font-body text-[9px] text-white/20">
                        {timeAgo(entry.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
