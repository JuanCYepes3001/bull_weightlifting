"use client";

import { useState } from "react";
import type { Product, ProductVariant } from "@/types";
import { VariantSelector } from "./VariantSelector";
import { AddToCartButton } from "./AddToCartButton";
import { SaleTimer } from "./SaleTimer";
import { SizeGuide } from "./SizeGuide";
import { TrusasCustomizer } from "./TrusasCustomizer";
import { ProductImage } from "./ProductImage";
import { getProductImageCandidates } from "@/lib/storage";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const isTrusas = product.category?.slug === "trusas";
  const images = product.images ?? [];
  const variants = product.variants ?? [];

  const uniqueColors = [...new Set(variants.map((v) => v.color))];
  // 2+ colors: gallery switches via the naming convention "{name} {COLOR}.<ext>".
  // 0-1 colors: nothing meaningful to switch by color, so the gallery instead
  // pages through the product's stored images directly (e.g. front/back shots).
  const hasColorGallery = uniqueColors.length > 1;

  const [activeColor, setActiveColor] = useState<string | null>(uniqueColors[0] ?? null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Candidates for the currently active image — every extension is tried
  // in order (color mode), falling back to a placeholder if none load.
  const activeCandidates = hasColorGallery && activeColor
    ? getProductImageCandidates(product.name, activeColor)
    : images.length > 0
    ? [images[Math.min(activeImageIndex, images.length - 1)].url]
    : [];

  const handleColorSelect = (color: string) => {
    setActiveColor(color);
  };

  const handleVariantSelect = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);
    if (variant?.color) {
      setActiveColor(variant.color);
    }
  };

  // Thumbnails: one per color when the gallery is color-driven, otherwise one
  // per stored image (e.g. front/back for single-color products).
  const thumbnails = hasColorGallery
    ? uniqueColors.map((color) => ({
        key: color,
        label: color,
        isActive: activeColor === color,
        candidates: getProductImageCandidates(product.name, color),
        onClick: () => handleColorSelect(color),
      }))
    : images.map((img, i) => ({
        key: img.id,
        label: img.alt ?? `Vista ${i + 1}`,
        isActive: activeImageIndex === i,
        candidates: [img.url],
        onClick: () => setActiveImageIndex(i),
      }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      {/* Galería */}
      <div className="space-y-3">
        {/* Imagen principal */}
        <div className="relative aspect-[4/5] bg-[#111] overflow-hidden border border-white/5">
          <ProductImage
            candidates={activeCandidates}
            alt={product.name}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            placeholderTextClassName="font-heading text-crimson/15 text-8xl tracking-widest select-none"
          />
        </div>

        {/* Thumbnails */}
        {thumbnails.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {thumbnails.map(({ key, label, isActive, candidates, onClick }) => (
              <button
                key={key}
                onClick={onClick}
                title={label}
                className={`relative shrink-0 w-16 h-20 bg-[#111] border transition-colors overflow-hidden ${
                  isActive ? "border-crimson" : "border-white/5 hover:border-white/20"
                }`}
              >
                <ProductImage candidates={candidates} alt={label} sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info + acciones */}
      <div className="space-y-6">
        {/* Categoría */}
        {product.category && (
          <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase">
            {product.category.name}
          </p>
        )}

        {/* Nombre */}
        <h1 className="text-3xl md:text-4xl text-white leading-tight">
          {product.name.toUpperCase()}
        </h1>

        {/* Precio */}
        {product.is_on_sale && product.sale_price ? (
          <div className="space-y-1">
            <p className="font-bebas text-3xl tracking-wider text-crimson">
              ${product.sale_price.toLocaleString("es-CO")}
              <span className="font-body text-sm text-crimson/60 ml-2 tracking-normal normal-case">COP</span>
            </p>
            <p className="font-body text-sm text-white/30 line-through">
              ${product.price.toLocaleString("es-CO")} COP
            </p>
            {product.discount_percent && (
              <span className="inline-block font-body text-[10px] tracking-widest uppercase bg-crimson text-white px-2 py-0.5">
                −{product.discount_percent}% OFF
              </span>
            )}
          </div>
        ) : (
          <p className="font-bebas text-3xl tracking-wider text-white">
            ${product.price.toLocaleString("es-CO")}
            <span className="font-body text-sm text-white/30 ml-2 tracking-normal normal-case">COP</span>
          </p>
        )}

        {/* Sale timer */}
        {product.is_on_sale && product.sale_end_at && (
          <SaleTimer saleEndAt={product.sale_end_at} />
        )}

        {/* Separador */}
        <div className="h-px bg-white/5" />

        {/* Selector de variantes */}
        {variants.length > 0 ? (
          <VariantSelector variants={variants} onSelect={handleVariantSelect} onColorSelect={handleColorSelect} />
        ) : (
          <p className="font-body text-sm text-white/30">Sin variantes disponibles.</p>
        )}

        {/* Personalización (solo trusas) */}
        {isTrusas && <TrusasCustomizer />}

        {/* Botón agregar */}
        <AddToCartButton
          product={product}
          selectedVariant={selectedVariant}
        />

        {/* Descripción */}
        {product.description && (
          <div className="border-t border-white/5 pt-6 space-y-2">
            <h3 className="text-sm text-white/70">DESCRIPCIÓN</h3>
            <p className="font-body text-sm text-white/40 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Low-stock urgency message */}
        {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 10 && (
          <div className="flex items-center gap-2.5 border border-amber-500/25 bg-amber-500/5 px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <p className="font-body text-xs text-amber-400/90 leading-snug">
              {selectedVariant.stock === 1
                ? "¡Solo queda 1 en stock! Cómpralo antes de que se agote."
                : `Solo quedan ${selectedVariant.stock} en stock. ¡No te quedes sin el tuyo!`}
            </p>
          </div>
        )}

        {/* Guía de tallas */}
        <SizeGuide />

        {/* Info adicional */}
        <div className="border-t border-white/5 pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-body text-xs text-white/30 tracking-wide uppercase">SKU</span>
            <span className="font-body text-xs text-white/40">
              {selectedVariant?.sku ?? "—"}
            </span>
          </div>
          {selectedVariant && (
            <div className="flex justify-between">
              <span className="font-body text-xs text-white/30 tracking-wide uppercase">Stock</span>
              <span className={`font-body text-xs ${selectedVariant.stock > 0 ? "text-white/40" : "text-red-400/70"}`}>
                {selectedVariant.stock > 0 ? `${selectedVariant.stock} disponibles` : "Agotado"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
