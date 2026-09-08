import { requireAuth } from "@/lib/auth";
import { getOrderById } from "@/lib/queries/orders";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Package, CreditCard, Calendar } from "lucide-react";
import type { Metadata } from "next";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Detalle de pedido | Bull Weightlifting" };

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    "Pendiente",
  processing: "En proceso",
  shipped:    "Enviado",
  delivered:  "Entregado",
  cancelled:  "Cancelado",
  refunded:   "Reembolsado",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:    "text-amber-400 border-amber-400/30 bg-amber-400/5",
  processing: "text-blue-400  border-blue-400/30  bg-blue-400/5",
  shipped:    "text-cyan-400  border-cyan-400/30  bg-cyan-400/5",
  delivered:  "text-green-400 border-green-400/30 bg-green-400/5",
  cancelled:  "text-red-400   border-red-400/30   bg-red-400/5",
  refunded:   "text-white/40  border-white/10     bg-white/5",
};

const STATUS_STEPS: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

const COP = (n: number) => "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 });

const PAY_LABELS: Record<string, string> = {
  nequi:         "Nequi",
  daviplata:     "Daviplata",
  contraentrega: "Contra entrega",
  paypal:        "PayPal",
  dollar_app:    "Dollar App",
  global66:      "Global 66",
  simulado:      "Pago simulado",
};

export default async function UserOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireAuth();
  const order = await getOrderById(id).catch(() => null);

  // Ensure the order belongs to the authenticated user
  if (!order || order.user_id !== user.id) notFound();

  const addr = order.shipping_address as unknown as Record<string, string> | null;
  const statusCls = STATUS_COLOR[order.status] ?? "text-white/40 border-white/10 bg-white/5";
  const statusLabel = STATUS_LABEL[order.status] ?? order.status;

  // Progress bar — only show for non-cancelled/refunded
  const activeStepIdx = STATUS_STEPS.indexOf(order.status as OrderStatus);
  const showProgress = activeStepIdx >= 0;

  // Detect payment method from payment_id
  const paymentIdStr = typeof order.payment_id === "string" ? order.payment_id : "";
  const paymentMethodKey = paymentIdStr.split("-")[0].toLowerCase();
  const paymentLabel = PAY_LABELS[paymentMethodKey] ?? paymentIdStr;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-12 space-y-10">
      {/* Back */}
      <Link
        href="/profile/orders"
        className="inline-flex items-center gap-1.5 font-body text-[10px] tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors"
      >
        <ArrowLeft size={11} /> Mis pedidos
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase">
          BULL WEIGHTLIFTING
        </p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl text-white">
              PEDIDO #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="font-body text-xs text-white/30 mt-1">
              {new Date(order.created_at).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span className={`shrink-0 font-body text-[9px] tracking-widest uppercase px-3 py-1 border ${statusCls}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Progress tracker */}
      {showProgress && (
        <div className="border border-white/5 bg-white/[0.02] px-5 py-5">
          <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/25 mb-4">
            Estado del pedido
          </p>
          {/* Dots + lines */}
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= activeStepIdx;
              const isLast = i === STATUS_STEPS.length - 1;
              return (
                <div key={step} className={`flex items-center ${!isLast ? "flex-1" : ""}`}>
                  <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${done ? "bg-crimson border-crimson" : "bg-transparent border-white/20"}`} />
                  {!isLast && (
                    <div className={`flex-1 h-px ${i < activeStepIdx ? "bg-crimson/60" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
          {/* Labels */}
          <div className="flex mt-2">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= activeStepIdx;
              const isLast = i === STATUS_STEPS.length - 1;
              return (
                <div key={step} className={`flex ${!isLast ? "flex-1" : ""} ${i === 0 ? "justify-start" : i === STATUS_STEPS.length - 1 ? "justify-end" : "justify-center"}`}>
                  <span className={`font-body text-[8px] tracking-wider uppercase whitespace-nowrap ${done ? "text-white/60" : "text-white/20"}`}>
                    {STATUS_LABEL[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-2">
        <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/25 flex items-center gap-2">
          <Package size={10} /> Productos
        </p>
        <div className="border border-white/5 divide-y divide-white/[0.04]">
          {order.items?.map((item) => {
            const product = item.variant?.product;
            const imgUrl = product?.images?.[0]?.url ?? null;
            const subtotal = item.unit_price * item.quantity;
            return (
              <div key={item.id} className="flex items-center gap-4 px-4 py-4">
                {imgUrl ? (
                  <div className="shrink-0 w-14 h-14 relative overflow-hidden bg-white/5">
                    <Image
                      src={imgUrl}
                      alt={product?.name ?? ""}
                      fill
                      className="object-contain"
                      sizes="56px"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-14 h-14 bg-white/5 flex items-center justify-center">
                    <Package size={16} className="text-white/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-horizon text-[11px] tracking-widest text-white truncate">
                    {product?.name ?? "Producto"}
                  </p>
                  <p className="font-body text-[10px] text-white/40 mt-0.5">
                    {item.variant?.size && `Talla: ${item.variant.size}`}
                    {item.variant?.color && ` · ${item.variant.color}`}
                    {` · ×${item.quantity}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-body text-sm text-white">{COP(subtotal)}</p>
                  {item.quantity > 1 && (
                    <p className="font-body text-[10px] text-white/25">{COP(item.unit_price)} c/u</p>
                  )}
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-between px-4 py-4 bg-white/[0.02]">
            <p className="font-body text-[10px] tracking-widest uppercase text-white/30">Total</p>
            <div className="text-right">
              <p className="font-bebas text-2xl tracking-wider text-white">{COP(order.total)}</p>
              <p className="font-body text-[9px] text-white/25 uppercase tracking-wider">COP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & shipping info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-white/5 bg-white/[0.02] p-5 space-y-2">
          <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/25 flex items-center gap-2">
            <CreditCard size={10} /> Pago
          </p>
          <p className="font-body text-sm text-white">{paymentLabel}</p>
          {order.payment_status && (
            <p className="font-body text-xs text-white/40">{order.payment_status}</p>
          )}
        </div>

        <div className="border border-white/5 bg-white/[0.02] p-5 space-y-2">
          <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/25 flex items-center gap-2">
            <Calendar size={10} /> Fecha
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
        </div>

        {addr && (
          <div className="border border-white/5 bg-white/[0.02] p-5 space-y-2 sm:col-span-2">
            <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/25 flex items-center gap-2">
              <MapPin size={10} /> Dirección de envío
            </p>
            <p className="font-body text-sm text-white">{addr.full_name}</p>
            <p className="font-body text-xs text-white/50">
              {addr.address ?? addr.street}
            </p>
            <p className="font-body text-xs text-white/50">
              {[addr.city, addr.state ?? addr.department, addr.country].filter(Boolean).join(", ")}
              {addr.zip_code ? ` — ${addr.zip_code}` : ""}
            </p>
            {addr.phone && (
              <p className="font-body text-xs text-white/30">{addr.phone}</p>
            )}
          </div>
        )}
      </div>

      {/* COD warning */}
      {paymentMethodKey === "contraentrega" && order.status !== "delivered" && (
        <div className="border border-amber-400/20 bg-amber-400/5 px-5 py-4">
          <p className="font-body text-xs text-amber-300">
            💵 Recuerda que pagarás{" "}
            <strong>{COP(order.total)} COP en efectivo</strong> al recibir el paquete.
          </p>
        </div>
      )}
    </div>
  );
}
