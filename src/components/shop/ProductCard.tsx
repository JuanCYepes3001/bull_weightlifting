import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0]?.url ?? null;
  const hasStock = product.variants?.some((v) => v.stock > 0) ?? false;
  const colors = [...new Set(product.variants?.map((v) => v.color) ?? [])];

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

        {/* Badge sin stock */}
        {!hasStock && (
          <div className="absolute top-3 left-3 bg-background/80 px-2 py-0.5">
            <span className="font-body text-[10px] tracking-widest uppercase text-white/40">
              Agotado
            </span>
          </div>
        )}

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

        <p className="font-bebas text-lg tracking-wider text-white mt-1">
          ${product.price.toLocaleString("es-CO")}
        </p>
      </div>
    </Link>
  );
}
