import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/shop/ProductCard";

interface BestSellersProps {
  products: Product[];
  fromSales: boolean;
}

export function BestSellers({ products, fromSales }: BestSellersProps) {
  if (!products.length) return null;

  return (
    <section className="bg-[#0D0D0D] px-4 md:px-8 py-14 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 mb-8 md:mb-10">
          <div className="min-w-0">
            <p className="font-anantason text-[10px] tracking-[0.6em] text-crimson uppercase mb-3">
              {fromSales ? "Favoritos de la comunidad" : "Selección Bull"}
            </p>
            <h2 className="font-heading text-2xl md:text-4xl text-white uppercase leading-none">
              {fromSales ? "Lo más vendido" : "Destacados"}
            </h2>
          </div>
          <Link
            href="/products"
            className="shrink-0 inline-flex items-center gap-2 font-body text-[10px] md:text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors"
          >
            Ver colección
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
