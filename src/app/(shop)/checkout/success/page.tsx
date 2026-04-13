"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight, AlertCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";

// ─── Payment instructions config ─────────────────────────
// Edit these values or set the corresponding NEXT_PUBLIC_ env vars.
const NEQUI_NUMBER    = process.env.NEXT_PUBLIC_NEQUI_NUMBER    ?? "000-000-0000";
const DAVIPLATA_NUMBER = process.env.NEXT_PUBLIC_DAVIPLATA_NUMBER ?? "000-000-0000";
const DOLLAR_APP_USER = process.env.NEXT_PUBLIC_DOLLAR_APP_USER ?? "@bull.weightlifting";
const GLOBAL66_ACCOUNT = process.env.NEXT_PUBLIC_GLOBAL66_ACCOUNT ?? "pagos@bullweightlifting.com";
const WHATSAPP_NUMBER  = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER  ?? "+57 300 000 0000";

interface MethodInfo {
  title: string;
  isPending: boolean;
  steps: string[];
  note?: string;
}

function getMethodInfo(method: string | null): MethodInfo | null {
  switch (method) {
    case "nequi":
      return {
        title: "Instrucciones de pago — Nequi",
        isPending: true,
        steps: [
          `Abre Nequi y envía el monto exacto al número ${NEQUI_NUMBER}.`,
          "Toma captura de pantalla del comprobante.",
          `Envíala por WhatsApp al ${WHATSAPP_NUMBER} con tu número de orden.`,
        ],
      };
    case "daviplata":
      return {
        title: "Instrucciones de pago — Daviplata",
        isPending: true,
        steps: [
          `Abre Daviplata y envía el monto exacto al número ${DAVIPLATA_NUMBER}.`,
          "Toma captura de pantalla del comprobante.",
          `Envíala por WhatsApp al ${WHATSAPP_NUMBER} con tu número de orden.`,
        ],
      };
    case "dollar_app":
      return {
        title: "Instrucciones de pago — Dollar App",
        isPending: true,
        steps: [
          `Abre Dollar App y envía el pago al usuario ${DOLLAR_APP_USER}.`,
          "Toma captura de pantalla del comprobante.",
          `Envíala por WhatsApp al ${WHATSAPP_NUMBER} con tu número de orden.`,
        ],
        note: "El monto en USD equivalente te será informado por WhatsApp.",
      };
    case "global66":
      return {
        title: "Instrucciones de pago — Global 66",
        isPending: true,
        steps: [
          `Realiza la transferencia desde tu cuenta Global 66 a ${GLOBAL66_ACCOUNT}.`,
          "Toma captura de pantalla del comprobante.",
          `Envíala por WhatsApp al ${WHATSAPP_NUMBER} con tu número de orden.`,
        ],
        note: "El monto exacto y los datos de la cuenta te llegarán por WhatsApp.",
      };
    case "paypal":
      return {
        title: "Pago procesado — PayPal",
        isPending: false,
        steps: [
          "Tu pago fue capturado exitosamente vía PayPal.",
          "Recibirás confirmación en el email asociado a tu cuenta PayPal.",
          "Procederemos a preparar y despachar tu pedido.",
        ],
      };
    default:
      return null;
  }
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const method  = searchParams.get("method");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const methodInfo = getMethodInfo(method);

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-8">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
        <CheckCircle2 size={40} className="text-green-400" />
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase">
          BULL WEIGHTLIFTING
        </p>
        <h1 className="text-3xl md:text-4xl text-white">¡ORDEN CONFIRMADA!</h1>
        <p className="font-body text-sm text-white/40 max-w-sm mx-auto mt-3">
          {methodInfo?.isPending
            ? "Tu pedido fue registrado. Completa el pago siguiendo las instrucciones de abajo."
            : "Tu pedido fue registrado y el pago procesado exitosamente."}
        </p>
      </div>

      {/* Order ID */}
      {orderId && (
        <div className="border border-white/5 bg-white/[0.02] px-6 py-4 space-y-1 w-full max-w-sm">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-white/30">
            Número de orden
          </p>
          <p className="font-body text-xs text-white/60 break-all">{orderId}</p>
        </div>
      )}

      {/* Payment instructions (pending methods) */}
      {methodInfo && (
        <div
          className={`border p-5 space-y-3 w-full max-w-sm text-left ${
            methodInfo.isPending
              ? "border-amber-500/20 bg-amber-500/5"
              : "border-white/5 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {methodInfo.isPending && (
              <AlertCircle size={13} className="text-amber-400 shrink-0" />
            )}
            <p
              className={`font-body text-[10px] tracking-[0.3em] uppercase ${
                methodInfo.isPending ? "text-amber-400" : "text-white/30"
              }`}
            >
              {methodInfo.title}
            </p>
          </div>

          {methodInfo.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="font-bebas text-crimson text-base leading-tight shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-body text-xs text-white/50">{step}</p>
            </div>
          ))}

          {methodInfo.note && (
            <p className="font-body text-[10px] text-white/30 pt-1 border-t border-white/5">
              {methodInfo.note}
            </p>
          )}
        </div>
      )}

      {/* Default next steps (no specific method) */}
      {!methodInfo && (
        <div className="border border-white/5 bg-white/[0.02] p-5 space-y-3 w-full max-w-sm text-left">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-white/30 mb-3">
            Próximos pasos
          </p>
          {[
            "Recibirás confirmación por WhatsApp con los detalles.",
            "Coordinaremos el pago y la guía de envío.",
            "Tu pedido llegará en 2–5 días hábiles.",
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="font-bebas text-crimson text-base leading-tight shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-body text-xs text-white/50">{step}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link href="/profile/account" className="flex-1 min-w-0">
          <Button variant="secondary" size="md" className="w-full gap-2 text-[10px] tracking-widest">
            <ShoppingBag size={13} />
            Mis órdenes
          </Button>
        </Link>
        <Link href="/products" className="flex-1 min-w-0">
          <Button size="md" className="w-full gap-2 text-[10px] tracking-widest">
            Seguir comprando
            <ArrowRight size={13} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
