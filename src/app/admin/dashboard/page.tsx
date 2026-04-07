import { getAdminStats, getLowStockProducts, getRecentActivity } from "@/lib/queries/admin";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  AlertTriangle,
  Activity,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Admin" };

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  product_created: { label: "Producto creado",     color: "text-green-400" },
  product_updated: { label: "Producto editado",    color: "text-blue-400" },
  product_deleted: { label: "Producto eliminado",  color: "text-red-400" },
  bulk_deleted:    { label: "Eliminación masiva",  color: "text-red-400" },
  stock_updated:   { label: "Stock actualizado",   color: "text-amber-400" },
  offer_applied:   { label: "Oferta aplicada",     color: "text-crimson" },
  variant_added:   { label: "Variante agregada",   color: "text-green-400" },
  variant_deleted: { label: "Variante eliminada",  color: "text-red-400" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `hace ${day}d`;
  if (hr > 0) return `hace ${hr}h`;
  if (min > 0) return `hace ${min}m`;
  return "ahora";
}

export default async function AdminDashboardPage() {
  const [stats, lowStock, activity] = await Promise.all([
    getAdminStats().catch(() => ({
      totalOrders: 0, totalRevenue: 0, activeProducts: 0, pendingOrders: 0,
    })),
    getLowStockProducts(10).catch(() => []),
    getRecentActivity(15).catch(() => []),
  ]);

  const cards = [
    { label: "Total Órdenes",      value: stats.totalOrders.toString(),           icon: ShoppingCart, color: "text-blue-400",   bg: "bg-blue-400/5 border-blue-400/10" },
    { label: "Ingresos",           value: `$${stats.totalRevenue.toLocaleString("es-CO")}`, sub: "COP", icon: DollarSign, color: "text-crimson",  bg: "bg-crimson/5 border-crimson/10" },
    { label: "Productos Activos",  value: stats.activeProducts.toString(),         icon: Package,      color: "text-green-400", bg: "bg-green-400/5 border-green-400/10" },
    { label: "Órdenes Pendientes", value: stats.pendingOrders.toString(),          icon: Clock,        color: "text-yellow-400",bg: "bg-yellow-400/5 border-yellow-400/10" },
  ];

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

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className={`border rounded-sm p-5 space-y-3 ${bg}`}>
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-white/40">
                {label}
              </p>
              <Icon size={14} className={color} />
            </div>
            <div>
              <p className={`font-bebas text-3xl tracking-wider ${color}`}>{value}</p>
              {sub && <p className="font-body text-[10px] text-white/20">{sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: quick actions + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="border border-white/5 p-6 space-y-4">
          <h2 className="font-body text-[10px] tracking-[0.3em] text-white/40 uppercase">
            Acciones rápidas
          </h2>
          <div className="flex flex-col gap-2">
            <a href="/admin/products/new"     className="font-body text-xs tracking-widest uppercase px-4 py-2.5 bg-crimson hover:bg-crimson-light text-white transition-colors text-center">+ Nuevo producto</a>
            <a href="/admin/products/bulk"    className="font-body text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-colors text-center">Carga masiva</a>
            <a href="/admin/inventory"        className="font-body text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-colors text-center">Gestionar inventario</a>
            <a href="/admin/offers"           className="font-body text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-colors text-center">Gestionar ofertas</a>
            <a href="/admin/orders"           className="font-body text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-colors text-center">Ver órdenes</a>
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
                const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, color: "text-white/50" };
                return (
                  <div key={entry.id} className="flex items-start gap-4 py-3">
                    {/* Action badge */}
                    <span className={`font-body text-[9px] tracking-widest uppercase shrink-0 w-32 ${meta.color}`}>
                      {meta.label}
                    </span>

                    {/* Entity name */}
                    <span className="font-body text-xs text-white/60 flex-1 truncate">
                      {entry.entity_name ?? "—"}
                    </span>

                    {/* Who + when */}
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
