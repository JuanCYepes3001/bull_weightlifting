import { getDailyStats, getWeeklyStats, getMonthlyStats, getAdminStats } from "@/lib/queries/admin";
import { AnalyticsClient } from "./AnalyticsClient";
import { ShoppingCart, DollarSign, Package, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analíticas | Admin" };

const COP = (n: number) =>
  "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 });

export default async function AnalyticsPage() {
  const [daily, weekly, monthly, stats] = await Promise.all([
    getDailyStats(30).catch(() => []),
    getWeeklyStats(12).catch(() => []),
    getMonthlyStats(12).catch(() => []),
    getAdminStats().catch(() => ({
      totalOrders: 0, totalRevenue: 0,
      monthlyOrders: 0, monthlyRevenue: 0,
      yearlyOrders: 0, yearlyRevenue: 0,
      activeProducts: 0, pendingOrders: 0,
    })),
  ]);

  const summaryCards = [
    {
      label: "Órdenes totales",
      value: stats.totalOrders.toString(),
      sub: `${stats.monthlyOrders} este mes`,
      icon: ShoppingCart,
      color: "text-blue-400",
      border: "border-blue-400/10",
      bg: "bg-blue-400/5",
    },
    {
      label: "Ingresos totales",
      value: COP(stats.totalRevenue),
      sub: `${COP(stats.monthlyRevenue)} este mes`,
      icon: DollarSign,
      color: "text-crimson",
      border: "border-crimson/10",
      bg: "bg-crimson/5",
    },
    {
      label: "Ingresos este año",
      value: COP(stats.yearlyRevenue),
      sub: `${stats.yearlyOrders} órdenes`,
      icon: TrendingUp,
      color: "text-green-400",
      border: "border-green-400/10",
      bg: "bg-green-400/5",
    },
    {
      label: "Productos activos",
      value: stats.activeProducts.toString(),
      sub: `${stats.pendingOrders} pendientes de despacho`,
      icon: Package,
      color: "text-yellow-400",
      border: "border-yellow-400/10",
      bg: "bg-yellow-400/5",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
          Panel de Control
        </p>
        <h1 className="text-2xl text-white">ANALÍTICAS</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map(({ label, value, sub, icon: Icon, color, border, bg }) => (
          <div key={label} className={`border ${border} ${bg} p-5 space-y-3`}>
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-white/40">{label}</p>
              <Icon size={13} className={color} />
            </div>
            <p className={`font-bebas text-2xl tracking-wider ${color}`}>{value}</p>
            <p className="font-body text-[10px] text-white/25">{sub}</p>
          </div>
        ))}
      </div>

      {/* Interactive chart section */}
      <div className="border border-white/5 p-6 space-y-2">
        <div className="mb-4">
          <p className="font-impact text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
            Comportamiento del negocio
          </p>
          <h2 className="text-xl text-white">VENTAS Y ÓRDENES</h2>
        </div>
        <AnalyticsClient daily={daily} weekly={weekly} monthly={monthly} />
      </div>
    </div>
  );
}
