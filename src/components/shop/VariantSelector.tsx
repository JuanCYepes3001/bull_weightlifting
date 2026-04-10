"use client";

import { useState } from "react";
import type { ProductVariant } from "@/types";
import { cn } from "@/utils/cn";

interface VariantSelectorProps {
  variants: ProductVariant[];
  onSelect: (variant: ProductVariant | null) => void;
}

export function VariantSelector({ variants, onSelect }: VariantSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Colores únicos con su hex
  const colorMap = new Map<string, string | null>();
  variants.forEach((v) => {
    if (!colorMap.has(v.color)) colorMap.set(v.color, v.color_hex ?? null);
  });

  const sizesForColor = selectedColor
    ? variants.filter((v) => v.color === selectedColor)
    : [];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null);
    onSelect(null);
  };

  const handleSizeSelect = (variant: ProductVariant) => {
    if (variant.stock === 0) return;
    setSelectedSize(variant.size);
    onSelect(variant);
  };

  return (
    <div className="space-y-5">
      {/* Selector de color */}
      <div>
        <p className="font-body text-xs tracking-widest uppercase text-white/40 mb-3">
          Color
          {selectedColor && (
            <span className="text-white/70 ml-2 normal-case tracking-normal">
              {selectedColor}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from(colorMap.entries()).map(([color, hex]) => {
            const isSelected = selectedColor === color;
            return (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                title={color}
                className={cn(
                  "flex items-center gap-2 font-body text-xs tracking-wide px-3 py-1.5 border transition-colors",
                  isSelected
                    ? "border-crimson text-white bg-crimson/10"
                    : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                )}
              >
                {hex && (
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                )}
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de talla */}
      {selectedColor && (
        <div>
          <p className="font-body text-xs tracking-widest uppercase text-white/40 mb-3">
            Talla
            {selectedSize && (
              <span className="text-white/70 ml-2 normal-case tracking-normal">
                {selectedSize}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSizeSelect(v)}
                disabled={v.stock === 0}
                className={cn(
                  "font-body text-xs tracking-widest uppercase w-12 h-10 border transition-colors",
                  v.stock === 0
                    ? "border-white/5 text-white/15 cursor-not-allowed line-through"
                    : selectedSize === v.size
                    ? "border-crimson text-white bg-crimson/10"
                    : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                )}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
