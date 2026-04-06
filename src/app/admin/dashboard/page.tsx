import { getAdminStats } from "@/lib/queries/admin";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Admin" };

export default async function AdminDashboardPage() {
  const stats = await getAdminStats().catch(() => ({
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    pendingOrders: 0,
  }));

  const cards = [
    {
      label: "Total Órdenes",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-400/5 border-blue-400/10",
    },
    {
      label: "Ingresos",
      value: `$${stats.totalRevenue.toLocaleString("es-CO")}`,
      sub: "COP",
      icon: DollarSign,
      color: "text-crimson",
      bg: "bg-crimson/5 border-crimson/10",
    },
    {
      label: "Productos Activos",
      value: stats.activeProducts.toString(),
      icon: Package,
      color: "text-green-400",
      bg: "bg-green-400/5 border-green-400/10",
    },
    {
      label: "Órdenes Pendientes",
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-400/5 border-yellow-400/10",
    },
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

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div
            key={label}
            className={`border rounded-sm p-5 space-y-3 ${bg}`}
          >
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-white/40">
                {label}
              </p>
              <Icon size={14} className={color} />
            </div>
            <div>
              <p className={`font-bebas text-3xl tracking-wider ${color}`}>
                {value}
              </p>
              {sub && (
                <p className="font-body text-[10px] text-white/20">{sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="border border-white/5 rounded-sm p-6 space-y-4">
        <h2 className="text-sm text-white/60 tracking-widest uppercase font-body">
          Acciones rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/products/new"
            className="font-body text-xs tracking-widest uppercase px-4 py-2.5 bg-crimson hover:bg-crimson-light text-white transition-colors"
          >
            + Nuevo producto
          </a>
          <a
            href="/admin/products"
            className="font-body text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-colors"
          >
            Ver productos
          </a>
          <a
            href="/admin/orders"
            className="font-body text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-colors"
          >
            Ver órdenes
          </a>
        </div>
      </div>
    </div>
  );
}
