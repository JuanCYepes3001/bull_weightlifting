"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const clearCart = useCartStore((s) => s.clearCart);

  // Clear cart once on mount
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-8">
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-400" />
        </div>
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase">
          BULL WEIGHTLIFTING
        </p>
        <h1 className="text-3xl md:text-4xl text-white">¡ORDEN CONFIRMADA!</h1>
        <p className="font-body text-sm text-white/40 max-w-sm mx-auto mt-3">
          Tu pedido fue registrado exitosamente. Pronto nos pondremos en contacto
          para confirmar el envío.
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

      {/* Next steps */}
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
