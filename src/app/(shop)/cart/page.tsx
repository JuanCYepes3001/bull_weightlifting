"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { CartItemRow } from "@/components/shop/CartItemRow";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const clearCart = useCartStore((s) => s.clearCart);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-24 flex flex-col items-center text-center gap-6">
        <span
          className="font-heading text-crimson/10 text-9xl tracking-widest select-none"
          aria-hidden
        >
          BULL
        </span>
        <ShoppingBag size={32} className="text-white/10" />
        <h1 className="text-white text-2xl">TU CARRITO ESTÁ VACÍO</h1>
        <p className="font-body text-sm text-white/30 max-w-xs">
          Explora la colección y agrega tus piezas favoritas.
        </p>
        <Link href="/products">
          <Button size="lg">Ver Colección</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase mb-1">
            BULL WEIGHTLIFTING
          </p>
          <h1 className="text-3xl md:text-5xl text-white">MI CARRITO</h1>
        </div>
        <Link
          href="/products"
          className="hidden md:flex items-center gap-1.5 font-body text-xs tracking-widest uppercase text-white/30 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Seguir comprando
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Items */}
        <div className="flex-1">
          {items.map((item) => (
            <CartItemRow key={item.variantId} item={item} />
          ))}

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearCart}
              className="font-body text-xs tracking-widest uppercase text-white/20 hover:text-red-400 transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        </div>

        {/* Resumen */}
        <aside className="lg:w-72 shrink-0">
          <div className="border border-white/5 p-6 space-y-5 sticky top-24">
            <h2 className="text-white text-xl">RESUMEN</h2>

            {/* Subtotal */}
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-xs">
                  <span className="font-body text-white/30 truncate max-w-[150px]">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-body text-white/50 shrink-0 ml-2">
                    ${(item.price * item.quantity).toLocaleString("es-CO")}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 flex justify-between items-baseline">
              <span className="font-body text-sm text-white/60 uppercase tracking-wider">
                Total
              </span>
              <span className="font-bebas text-2xl tracking-wider text-white">
                ${total.toLocaleString("es-CO")}
              </span>
            </div>

            <p className="font-body text-[10px] text-white/20 tracking-wide">
              Envío calculado en el checkout
            </p>

            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full">
                Proceder al pago
              </Button>
            </Link>

            <Link href="/products" className="block md:hidden text-center">
              <Button variant="ghost" size="sm" className="w-full">
                Seguir comprando
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
