import { requireAuth } from "@/lib/auth";
import { getUserOrders } from "@/lib/queries/orders";
import Link from "next/link";
import { Package } from "lucide-react";
import type { Metadata } from "next";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Mis pedidos | Bull Weightlifting" };

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    "Pendiente",
  processing: "En proceso",
  shipped:    "Enviada",
  delivered:  "Entregada",
  cancelled:  "Cancelada",
  refunded:   "Reembolsada",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:    "text-amber-400 border-amber-400/30 bg-amber-400/5",
  processing: "text-blue-400  border-blue-400/30  bg-blue-400/5",
  shipped:    "text-cyan-400  border-cyan-400/30  bg-cyan-400/5",
  delivered:  "text-green-400 border-green-400/30 bg-green-400/5",
  cancelled:  "text-red-400   border-red-400/30   bg-red-400/5",
  refunded:   "text-white/40  border-white/10     bg-white/5",
};

export default async function OrdersPage() {
  const { user } = await requireAuth();
  const orders = await getUserOrders(user.id).catch(() => []);

  const totalSpent = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase mb-1">
          BULL WEIGHTLIFTING
        </p>
        <h1 className="text-3xl md:text-4xl text-white">MIS PEDIDOS</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total pedidos",  value: orders.length },
          { label: "Entregados",     value: orders.filter((o) => o.status === "delivered").length },
          { label: "Total gastado",  value: `$${totalSpent.toLocaleString("es-CO")} COP`, wide: true },
        ].map((s) => (
          <div key={s.label} className="border border-white/5 bg-white/[0.02] px-4 py-4">
            <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/30 mb-1">
              {s.label}
            </p>
            <p className="font-bebas text-2xl tracking-wider text-white">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Order list */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Package size={40} className="text-white/10" />
          <p className="font-body text-sm text-white/30">
            Aún no tienes pedidos.{" "}
            <Link href="/products" className="text-white/50 hover:text-white underline transition-colors">
              Ver colección
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const addr = order.shipping_address as { full_name?: string; city?: string } | null;
            const itemCount = order.items?.length ?? 0;
            const statusClass = STATUS_COLOR[order.status] ?? "text-white/40 border-white/10 bg-white/5";

            return (
              <div
                key={order.id}
                className="flex items-center gap-4 border border-white/5 bg-white/[0.02] px-5 py-4"
              >
                {/* Order info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-body text-[10px] tracking-[0.25em] uppercase text-white/30">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`font-body text-[9px] tracking-widest uppercase px-2 py-0.5 border ${statusClass}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  <p className="font-body text-xs text-white/50 truncate">
                    {addr?.full_name && `${addr.full_name} — `}
                    {itemCount} producto{itemCount !== 1 ? "s" : ""}
                    {addr?.city && ` · ${addr.city}`}
                  </p>

                  <p className="font-body text-[10px] text-white/25">
                    {new Date(order.created_at).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Total */}
                <div className="shrink-0 text-right">
                  <p className="font-bebas text-xl tracking-wider text-white">
                    ${order.total.toLocaleString("es-CO")}
                  </p>
                  <p className="font-body text-[9px] text-white/25 uppercase tracking-wider">COP</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/profile/account"
        className="inline-block font-body text-xs tracking-widest uppercase text-white/30 hover:text-white transition-colors"
      >
        ← Volver al perfil
      </Link>
    </div>
  );
}
