import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { getProductImageUrl } from "@/lib/storage";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const colors = [...new Set(product.variants?.map((v) => v.color) ?? [])];
  const firstColor = colors[0];
  // Build URL from storage naming convention: "{Product Name} {COLOR}.jpeg"
  // Falls back to DB image if no color variants exist
  const mainImage = firstColor
    ? getProductImageUrl(product.name, firstColor)
    : (product.images?.[0]?.url ?? null);
  const hasStock = product.variants?.some((v) => v.stock > 0) ?? false;
  const isCustomizable = product.category?.slug === "trusas";
  
  const now = new Date();
  const isSaleActive = product.is_on_sale && 
    (!product.sale_start_at || new Date(product.sale_start_at) <= now) &&
    (!product.sale_end_at || new Date(product.sale_end_at) >= now);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col border border-white/5 hover:border-crimson/30 transition-colors overflow-hidden"
    >
      {/* Imagen / placeholder */}
      <div className="relative aspect-[3/4] bg-[#111] overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <span
              className="font-heading text-crimson/20 text-6xl tracking-widest select-none"
              aria-hidden="true"
            >
              BULL
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {!hasStock && !isCustomizable && (
            <div className="bg-background/80 px-2 py-0.5">
              <span className="font-body text-[10px] tracking-widest uppercase text-white/40">
                Agotado
              </span>
            </div>
          )}
          {isCustomizable && (
            <div className="bg-background/80 px-2 py-0.5">
              <span className="font-body text-[10px] tracking-widest uppercase text-crimson/70">
                Personalizable
              </span>
            </div>
          )}
          {isSaleActive && (
            <div className="bg-crimson px-2 py-0.5 flex items-center gap-1.5 shadow-lg shadow-crimson/20">
              <span className="font-bebas text-[11px] tracking-[0.15em] uppercase text-white">
                OFERTA
              </span>
              {product.discount_percent && (
                <span className="font-bebas text-[11px] text-white/70">
                  -{product.discount_percent}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Red hover line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-crimson scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5">
        {product.category && (
          <p className="font-impact text-[9px] tracking-[0.4em] text-crimson/70 uppercase">
            {product.category.name}
          </p>
        )}
        <h3 className="font-heading text-sm tracking-wide text-white uppercase leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Colores disponibles */}
        {colors.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {colors.slice(0, 5).map((color) => (
              <span
                key={color}
                className="font-body text-[9px] text-white/30 tracking-wide"
              >
                {color}
                {colors.indexOf(color) < Math.min(colors.length, 5) - 1 ? " ·" : ""}
              </span>
            ))}
            {colors.length > 5 && (
              <span className="font-body text-[9px] text-white/20">+{colors.length - 5}</span>
            )}
          </div>
        )}

        {isSaleActive && product.sale_price != null ? (
          <div className="flex items-baseline gap-2 mt-1">
            <p className="font-bebas text-lg tracking-wider text-crimson">
              ${product.sale_price.toLocaleString("es-CO")}
            </p>
            <p className="font-bebas text-xs tracking-wider text-white/30 line-through">
              ${product.price.toLocaleString("es-CO")}
            </p>
          </div>
        ) : (
          <p className="font-bebas text-lg tracking-wider text-white mt-1">
            ${product.price.toLocaleString("es-CO")}
          </p>
        )}
      </div>
    </Link>
  );
}
