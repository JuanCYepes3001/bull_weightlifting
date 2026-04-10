"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useCartStore } from "@/store/cartStore";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity } = useCartStore();
  const total = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Portal mount guard — avoids SSR mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const drawer = drawerRef.current;
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!drawer || !overlay || !container) return;

    if (isOpen) {
      container.style.pointerEvents = "auto";
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.fromTo(drawer, { x: "100%" }, { x: "0%", duration: 0.4, ease: "power3.out" });
    } else {
      gsap.to(drawer, { x: "100%", duration: 0.3, ease: "power3.in" });
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          container.style.pointerEvents = "none";
        },
      });
    }
  }, [isOpen]);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  // Render into document.body via portal to escape the GSAP-transformed nav
  // (transforms on ancestors break fixed positioning of descendants)
  if (!mounted) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200]"
      style={{ pointerEvents: "none" }}
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-full max-w-[420px] bg-[#1A1A1A] border-l border-white/5 flex flex-col"
        style={{ transform: "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={15} className="text-crimson" />
            <span className="font-horizon text-[11px] tracking-[0.3em] uppercase text-white">
              Carrito
            </span>
            {itemCount > 0 && (
              <span className="bg-crimson text-white font-body text-[9px] rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/30 hover:text-white transition-colors p-1"
            aria-label="Cerrar carrito"
          >
            <X size={17} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 py-20">
              <ShoppingBag size={44} className="text-white/8" />
              <div className="text-center space-y-1">
                <p className="font-horizon text-xs tracking-[0.3em] text-white/20 uppercase">
                  El que para, pierde
                </p>
                <p className="font-body text-xs text-white/30 mt-2">
                  Aún no tienes productos en tu carrito.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-1 font-body text-xs text-crimson hover:text-crimson-light underline underline-offset-4 transition-colors"
              >
                Explorar colección →
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-4 pb-5 border-b border-white/5 last:border-0"
              >
                {/* Thumbnail */}
                <div className="w-16 h-20 bg-[#222] flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-horizon text-[11px] tracking-widest text-white uppercase truncate">
                    {item.productName}
                  </p>
                  <p className="font-body text-[11px] text-white/30 mt-0.5">
                    {item.size} · {item.color}
                  </p>
                  <p className="font-bebas text-lg tracking-wider text-white mt-1">
                    ${item.price.toLocaleString("es-CO")}
                    <span className="font-body text-[10px] text-white/30 ml-1 normal-case tracking-normal">COP</span>
                  </p>

                  {/* Qty + remove */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="w-6 h-6 border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center text-base leading-none"
                    >
                      −
                    </button>
                    <span className="font-body text-sm text-white/70 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="w-6 h-6 border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center text-base leading-none"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="ml-auto text-white/20 hover:text-red-400 transition-colors p-1"
                      aria-label="Eliminar"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/5 px-6 py-5 space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between py-1">
              <span className="font-body text-[11px] tracking-[0.2em] uppercase text-white/40">
                Subtotal
              </span>
              <span className="font-bebas text-xl tracking-wider text-white">
                ${total.toLocaleString("es-CO")}
                <span className="font-body text-[10px] text-white/30 ml-1 normal-case tracking-normal">COP</span>
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-crimson hover:bg-crimson-light text-white font-horizon text-[11px] tracking-[0.2em] uppercase py-4 transition-colors"
            >
              Finalizar compra <ArrowRight size={13} />
            </Link>

            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-full border border-white/10 hover:border-white/30 text-white/40 hover:text-white font-body text-[11px] tracking-[0.15em] uppercase py-3 transition-colors"
            >
              Ver carrito completo
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
