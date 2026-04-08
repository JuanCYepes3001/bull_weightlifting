"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCartStore, type LocalCartItem } from "@/store/cartStore";

interface CartItemRowProps {
  item: LocalCartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-5 border-b border-white/5">
      {/* Imagen */}
      <Link
        href={`/products/${item.productSlug}`}
        className="relative shrink-0 w-20 h-24 bg-[#111] border border-white/5 overflow-hidden flex items-center justify-center"
      >
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.productName} fill sizes="80px" className="object-cover" />
        ) : (
          <span className="font-heading text-crimson/20 text-2xl" aria-hidden>B</span>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <Link
          href={`/products/${item.productSlug}`}
          className="font-heading text-sm tracking-wide text-white uppercase hover:text-crimson transition-colors truncate"
        >
          {item.productName}
        </Link>
        <p className="font-body text-xs text-white/30">
          {item.color} · {item.size}
        </p>
        <p className="font-bebas text-base tracking-wider text-white mt-auto">
          ${(item.price * item.quantity).toLocaleString("es-CO")}
        </p>
      </div>

      {/* Cantidad + eliminar */}
      <div className="flex flex-col items-end justify-between gap-2 shrink-0">
        {/* Eliminar */}
        <button
          onClick={() => removeItem(item.variantId)}
          className="text-white/20 hover:text-red-400 transition-colors"
          aria-label="Eliminar"
        >
          <Trash2 size={14} />
        </button>

        {/* Controles cantidad */}
        <div className="flex flex-col items-end gap-1">
          {item.maxStock !== undefined && item.quantity >= item.maxStock && (
            <p className="font-body text-[9px] text-yellow-500/80 tracking-wide whitespace-nowrap">
              Máx. {item.maxStock} uds.
            </p>
          )}
          <div className="flex items-center border border-white/10">
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              aria-label="Reducir"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center font-body text-xs text-white">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
              className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Aumentar"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
