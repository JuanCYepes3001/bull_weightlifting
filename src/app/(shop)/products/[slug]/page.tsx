import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description ?? `${product.name} — Bull Weightlifting`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product) notFound();

  const related = await getRelatedProducts(
    product.category_id,
    product.id,
    4
  ).catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-10 text-white/30 font-body text-xs">
        <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-white transition-colors">Colección</Link>
        <span>/</span>
        <span className="text-white/60 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Back */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1 font-body text-xs text-white/30 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft size={14} />
        Volver a la colección
      </Link>

      {/* Detalle principal */}
      <ProductDetailClient product={product} />

      {/* Productos relacionados */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-white/5 pt-12">
          <h2 className="text-white text-2xl md:text-3xl mb-8">
            TAMBIÉN TE PUEDE GUSTAR
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
