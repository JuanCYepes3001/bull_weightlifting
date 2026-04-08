"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ExternalLink, ChevronDown } from "lucide-react";
import Link from "next/link";
import { updateOrderStatusAction } from "@/app/actions/orders";
import type { AdminOrder } from "@/lib/queries/admin";

/* ─── Constants ─────────────────────────────────────────── */

const STATUS_TABS = [
  { key: "all",        label: "Todas" },
  { key: "pending",    label: "Pendientes" },
  { key: "processing", label: "En proceso" },
  { key: "shipped",    label: "Enviadas" },
  { key: "delivered",  label: "Entregadas" },
  { key: "cancelled",  label: "Canceladas" },
  { key: "refunded",   label: "Reembolsadas" },
] as const;

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Pendiente",    cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  processing: { label: "En proceso",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  shipped:    { label: "Enviada",      cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  delivered:  { label: "Entregada",    cls: "bg-green-500/10 text-green-400 border-green-500/20" },
  cancelled:  { label: "Cancelada",    cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  refunded:   { label: "Reembolsada",  cls: "bg-white/10 text-white/40 border-white/10" },
};

const COP = (n: number) =>
  "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 });

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { label: status, cls: "bg-white/5 text-white/40 border-white/10" };
  return (
    <span className={`inline-block font-body text-[9px] tracking-widest uppercase px-2 py-0.5 border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function StatusSelect({
  orderId,
  current,
  onUpdated,
}: {
  orderId: string;
  current: string;
  onUpdated: (id: string, status: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

  const change = (status: string) => {
    setOpen(false);
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, status);
      if (!res.error) onUpdated(orderId, status);
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="flex items-center gap-1 text-white/30 hover:text-white/60 transition-colors disabled:opacity-40"
        title="Cambiar estado"
      >
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-5 z-50 bg-[#1a1a1a] border border-white/10 min-w-[140px] shadow-xl">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => change(s)}
              className={`w-full text-left px-3 py-2 font-body text-[10px] tracking-widest uppercase transition-colors ${
                s === current
                  ? "text-crimson bg-crimson/5"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {STATUS_STYLE[s]?.label ?? s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────── */

export default function OrdersClient({
  orders: initialOrders,
  activeStatus,
}: {
  orders: AdminOrder[];
  activeStatus: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const setStatusFilter = (status: string) => {
    if (status === "all") router.push("/admin/orders");
    else router.push(`/admin/orders?status=${status}`);
  };

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 border-b border-white/5 pb-4">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`font-body text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
              activeStatus === key
                ? "border-crimson/40 bg-crimson/10 text-crimson"
                : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por ID o nombre..."
          className="w-full bg-white/5 border border-white/10 pl-9 pr-9 py-2.5 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border border-white/5 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              {["ID de orden", "Cliente", "Fecha", "Total", "Estado", ""].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-body text-[10px] tracking-[0.25em] uppercase text-white/30"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center font-body text-sm text-white/20"
                >
                  {search
                    ? "No hay órdenes que coincidan con la búsqueda."
                    : "No hay órdenes en esta categoría."}
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  {/* ID */}
                  <td className="px-4 py-3 font-body text-[10px] text-white/40 font-mono">
                    {order.id.slice(0, 8).toUpperCase()}
                    <span className="text-white/20">…</span>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <p className="font-body text-xs text-white/70">
                      {order.customer?.name ?? "—"}
                    </p>
                    {order.customer?.phone && (
                      <p className="font-body text-[10px] text-white/30">
                        {order.customer.phone}
                      </p>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 font-body text-xs text-white/40 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3 font-bebas text-lg tracking-wider text-white/80">
                    {COP(order.total)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      <StatusSelect
                        orderId={order.id}
                        current={order.status}
                        onUpdated={handleStatusUpdate}
                      />
                    </div>
                  </td>

                  {/* Detail link */}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 font-body text-[10px] tracking-widest uppercase text-white/20 hover:text-white/60 transition-colors"
                    >
                      Ver <ExternalLink size={10} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="font-body text-[9px] text-white/20 uppercase tracking-widest">
        {filtered.length} orden{filtered.length !== 1 ? "es" : ""}
        {search && ` · búsqueda: "${search}"`}
      </p>
    </div>
  );
}
