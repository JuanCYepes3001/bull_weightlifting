import type { TopProduct, CompletionStats } from "@/lib/queries/admin";
import Link from "next/link";
import { TrendingUp, Award } from "lucide-react";

const COP = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`;

export function TopProductsWidget({
  products,
  completion,
}: {
  products: TopProduct[];
  completion: CompletionStats;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Completion rate stat */}
      <div className="border border-white/5 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Award size={12} className="text-white/30" />
          <h2 className="font-body text-[10px] tracking-[0.3em] text-white/40 uppercase">
            Tasa de completación
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center py-4 gap-2">
          <p
            className="font-bebas text-6xl tracking-wider"
            style={{
              color:
                completion.completionRate >= 80
                  ? "#4ade80"
                  : completion.completionRate >= 60
                  ? "#facc15"
                  : "#f87171",
            }}
          >
            {completion.completionRate}%
          </p>
          <p className="font-body text-[10px] text-white/25 tracking-widest uppercase text-center">
            Órdenes no canceladas
          </p>
        </div>

        <div className="space-y-2 border-t border-white/5 pt-4">
          {[
            { label: "Total órdenes", value: completion.total, color: "text-white/60" },
            { label: "Entregadas",    value: completion.delivered, color: "text-green-400" },
            { label: "Canceladas",   value: completion.cancelled,  color: "text-red-400/70" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="font-body text-[10px] tracking-wide text-white/30 uppercase">
                {label}
              </span>
              <span className={`font-bebas text-sm tracking-wider ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top products table */}
      <div className="lg:col-span-2 border border-white/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={12} className="text-white/30" />
          <h2 className="font-body text-[10px] tracking-[0.3em] text-white/40 uppercase">
            Top productos vendidos
          </h2>
        </div>

        {products.length === 0 ? (
          <p className="font-body text-xs text-white/20 py-4 text-center">
            Sin órdenes registradas aún.
          </p>
        ) : (
          <div className="space-y-0 divide-y divide-white/[0.04]">
            {/* Header */}
            <div className="flex items-center gap-4 pb-2">
              <span className="w-6 shrink-0" />
              <span className="flex-1 font-body text-[9px] tracking-[0.3em] uppercase text-white/20">
                Producto
              </span>
              <span className="font-body text-[9px] tracking-[0.3em] uppercase text-white/20 w-16 text-right">
                Unidades
              </span>
              <span className="font-body text-[9px] tracking-[0.3em] uppercase text-white/20 w-20 text-right">
                Ingresos
              </span>
            </div>

            {products.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-4 py-3">
                <span className="font-bebas text-base text-white/20 w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Link
                  href={`/admin/products/${p.productId}`}
                  className="flex-1 min-w-0 hover:text-white transition-colors"
                >
                  <span className="font-body text-xs text-white/70 truncate block">
                    {p.productName}
                  </span>
                </Link>
                <span className="font-bebas text-sm tracking-wider text-crimson w-16 text-right">
                  {p.unitsSold}
                </span>
                <span className="font-body text-[10px] text-white/40 w-20 text-right">
                  {COP(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
