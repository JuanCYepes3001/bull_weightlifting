"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import type { Product, ProductVariant } from "@/types";
import { cn } from "@/utils/cn";

interface AddToCartButtonProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export function AddToCartButton({ product, selectedVariant }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setIsOpen);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!selectedVariant) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: product.is_on_sale && product.sale_price ? product.sale_price : product.price,
      imageUrl: product.images?.[0]?.url ?? null,
    });

    setAdded(true);
    // Brief delay before opening so the user sees the "Agregado" confirmation
    setTimeout(() => setCartOpen(true), 400);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;
  const isDisabled = !selectedVariant || isOutOfStock;

  return (
    <button
      onClick={handleAdd}
      disabled={isDisabled}
      className={cn(
        "w-full h-13 flex items-center justify-center gap-3 font-heading tracking-widest uppercase text-sm transition-all duration-200",
        added
          ? "bg-green-900/80 text-white"
          : isDisabled
          ? "bg-white/5 text-white/20 cursor-not-allowed"
          : "bg-crimson hover:bg-crimson-light text-white active:scale-[0.98]"
      )}
    >
      {added ? (
        <>
          <Check size={16} />
          Agregado al carrito
        </>
      ) : isOutOfStock ? (
        "Sin stock"
      ) : !selectedVariant ? (
        <>
          <ShoppingBag size={16} />
          Selecciona color y talla
        </>
      ) : (
        <>
          <ShoppingBag size={16} />
          Agregar al carrito
        </>
      )}
    </button>
  );
}
