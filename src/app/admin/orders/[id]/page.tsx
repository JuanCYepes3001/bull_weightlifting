import { getAdminOrderById } from "@/lib/queries/admin";
import { updateOrderStatusAction } from "@/app/actions/orders";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Phone,
  Calendar,
  CreditCard,
} from "lucide-react";
import type { Metadata } from "next";
import OrderStatusUpdater from "./OrderStatusUpdater";

export const metadata: Metadata = { title: "Detalle de Orden | Admin" };

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Pendiente",   cls: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10" },
  processing: { label: "En proceso",  cls: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
  shipped:    { label: "Enviada",     cls: "text-purple-400 border-purple-500/20 bg-purple-500/10" },
  delivered:  { label: "Entregada",   cls: "text-green-400 border-green-500/20 bg-green-500/10" },
  cancelled:  { label: "Cancelada",   cls: "text-red-400 border-red-500/20 bg-red-500/10" },
  refunded:   { label: "Reembolsada", cls: "text-white/40 border-white/10 bg-white/5" },
};

const COP = (n: number) =>
  "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 });

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id).catch(() => null);
  if (!order) notFound();

  const statusMeta = STATUS_STYLE[order.status] ?? {
    label: order.status,
    cls: "text-white/40 border-white/10 bg-white/5",
  };

  const addr = order.shipping_address as Record<string, string>;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Back + header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 font-body text-[10px] tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors mb-4"
        >
          <ArrowLeft size={11} /> Volver a Órdenes
        </Link>
        <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
          Detalle de Orden
        </p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-mono text-lg text-white break-all">
            #{order.id.toUpperCase()}
          </h1>
          <span
            className={`shrink-0 inline-block font-body text-[10px] tracking-widest uppercase px-3 py-1 border ${statusMeta.cls}`}
          >
            {statusMeta.label}
          </span>
        </div>
      </div>

      {/* Status updater */}
      <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />

      {/* Meta grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Customer */}
        <div className="border border-white/5 p-5 space-y-3">
          <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/25 flex items-center gap-2">
            <User size={10} /> Cliente
          </p>
          <p className="font-body text-sm text-white">
            {order.customer?.name ?? "Usuario desconocido"}
          </p>
          {order.customer?.phone && (
            <p className="font-body text-xs text-white/40 flex items-center gap-1.5">
              <Phone size={10} /> {order.customer.phone}
            </p>
          )}
        </div>

        {/* Date & payment */}
        <div className="border border-white/5 p-5 space-y-3">
          <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/25 flex items-center gap-2">
            <Calendar size={10} /> Fecha y pago
          </p>
          <p className="font-body text-sm text-white">
            {new Date(order.created_at).toLocaleString("es-CO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {order.payment_id && (
            <p className="font-body text-xs text-white/40 flex items-center gap-1.5">
              <CreditCard size={10} /> {order.payment_id}
            </p>
          )}
          {order.payment_status && (
            <p className="font-body text-[10px] text-white/30">
              Estado pago: {order.payment_status}
            </p>
          )}
        </div>

        {/* Shipping address */}
        <div className="border border-white/5 p-5 space-y-3 sm:col-span-2">
          <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/25 flex items-center gap-2">
            <MapPin size={10} /> Dirección de envío
          </p>
          {addr ? (
            <div className="font-body text-sm text-white space-y-1">
              <p>{addr.address ?? addr.street}</p>
              <p className="text-white/50">
                {addr.city}
                {(addr.state ?? addr.department) ? `, ${addr.state ?? addr.department}` : ""}
                {addr.country ? `, ${addr.country}` : ""}
                {addr.zip_code ? ` — ${addr.zip_code}` : ""}
              </p>
              {addr.full_name && (
                <p className="text-white/40 text-xs">{addr.full_name}{addr.phone ? ` · ${addr.phone}` : ""}</p>
              )}
            </div>
          ) : (
            <p className="font-body text-xs text-white/20">Sin dirección registrada</p>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="space-y-3">
        <p className="font-body text-[10px] tracking-[0.3em] uppercase text-white/30 flex items-center gap-2">
          <Package size={10} /> Productos comprados
        </p>
        <div className="border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                {["Producto", "Talla", "Color", "Cant.", "Precio unit.", "Subtotal"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-body text-[9px] tracking-[0.2em] uppercase text-white/25"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {order.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center font-body text-sm text-white/20"
                  >
                    Sin productos registrados
                  </td>
                </tr>
              ) : (
                order.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 font-horizon text-[11px] tracking-widest text-white">
                      {item.variant?.product?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-white/60">
                      {item.variant?.size ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-white/60">
                      {item.variant?.color ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-bebas text-xl tracking-wider text-white/80">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-white/50">
                      {COP(item.unit_price)}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-white/80">
                      {COP(item.unit_price * item.quantity)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 bg-white/[0.02]">
                <td
                  colSpan={5}
                  className="px-4 py-4 font-body text-[10px] tracking-widest uppercase text-white/30 text-right"
                >
                  Total
                </td>
                <td className="px-4 py-4 font-bebas text-2xl tracking-wider text-crimson">
                  {COP(order.total)}
                  <span className="font-body text-[10px] text-white/20 ml-1">COP</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="border border-white/5 p-5 space-y-2">
          <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/25">
            Notas
          </p>
          <p className="font-body text-sm text-white/60">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
