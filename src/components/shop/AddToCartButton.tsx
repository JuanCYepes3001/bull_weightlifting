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
  const addItem     = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setIsOpen);
  const cartItems   = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);

  const existingQty = selectedVariant
    ? (cartItems.find((i) => i.variantId === selectedVariant.id)?.quantity ?? 0)
    : 0;

  const isOutOfStock  = selectedVariant ? selectedVariant.stock === 0 : false;
  const isAtMaxStock  = selectedVariant ? existingQty >= selectedVariant.stock : false;
  const isDisabled    = !selectedVariant || isOutOfStock || isAtMaxStock;

  const handleAdd = () => {
    if (!selectedVariant || isDisabled) return;

    addItem({
      variantId:   selectedVariant.id,
      productId:   product.id,
      productName: product.name,
      productSlug: product.slug,
      size:        selectedVariant.size,
      color:       selectedVariant.color,
      price:       product.is_on_sale && product.sale_price ? product.sale_price : product.price,
      imageUrl:    product.images?.[0]?.url ?? null,
      maxStock:    selectedVariant.stock,
    });

    setAdded(true);
    setTimeout(() => setCartOpen(true), 400);
    setTimeout(() => setAdded(false), 2000);
  };

  const label = (() => {
    if (added)           return <><Check size={16} />Agregado al carrito</>;
    if (!selectedVariant) return <><ShoppingBag size={16} />Selecciona color y talla</>;
    if (isOutOfStock)    return "Sin stock";
    if (isAtMaxStock)    return `Solo hay ${selectedVariant.stock} unidad${selectedVariant.stock !== 1 ? "es" : ""} disponible${selectedVariant.stock !== 1 ? "s" : ""}`;
    return <><ShoppingBag size={16} />Agregar al carrito</>;
  })();

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
      {label}
    </button>
  );
}
