import { Suspense } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/queries/products";
import { getCategories } from "@/lib/queries/categories";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Gender, ProductFilters } from "@/types";

interface ProductsPageProps {
  searchParams: Promise<{
    gender?: string;
    category?: string;
    q?: string;
    page?: string;
  }>;
}

export const metadata = { title: "Colección" };

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { gender, category, q, page } = await searchParams;

  const filters: ProductFilters = {
    ...(category && { category_id: category }),
    ...(q && { search: q }),
  };

  // Filtro por género: buscar categorías de ese género primero
  let categoryIds: string[] | null = null;
  if (gender) {
    const cats = await getCategories(gender as Gender).catch(() => []);
    categoryIds = cats.map((c) => c.id);
    if (categoryIds.length === 0) categoryIds = ["__none__"];
  }

  const currentPage = Math.max(1, parseInt(page ?? "1", 10));

  const [{ data: products, total, total_pages }, allCategories] =
    await Promise.all([
      getProducts(filters, { page: currentPage, limit: 12 }).catch(() => ({
        data: [],
        total: 0,
        page: 1,
        limit: 12,
        total_pages: 0,
      })),
      getCategories().catch(() => []),
    ]);

  // Filtrar por gender en memoria si no está directo en query
  const filteredProducts = categoryIds
    ? products.filter((p) => categoryIds!.includes(p.category_id))
    : products;

  const genders: Array<{ value: Gender | "all"; label: string }> = [
    { value: "all", label: "Todo" },
    { value: "hombre", label: "Hombre" },
    { value: "mujer", label: "Mujer" },
    { value: "unisex", label: "Unisex" },
  ];

  const activeGender = gender ?? "all";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase mb-1">
          BULL WEIGHTLIFTING
        </p>
        <h1 className="text-4xl md:text-6xl text-white">COLECCIÓN</h1>
        {total > 0 && (
          <p className="font-body text-xs text-white/30 mt-2">
            {total} producto{total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar filtros */}
        <aside className="md:w-48 shrink-0 space-y-8">
          {/* Género */}
          <div>
            <h3 className="text-xs tracking-[0.3em] text-white mb-3">GÉNERO</h3>
            <ul className="space-y-2">
              {genders.map(({ value, label }) => {
                const href =
                  value === "all"
                    ? "/products"
                    : `/products?gender=${value}`;
                return (
                  <li key={value}>
                    <Link
                      href={href}
                      className={`font-body text-sm block transition-colors ${
                        activeGender === value
                          ? "text-crimson"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Categorías */}
          {allCategories.length > 0 && (
            <div>
              <h3 className="text-xs tracking-[0.3em] text-white mb-3">CATEGORÍAS</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={gender ? `/products?gender=${gender}` : "/products"}
                    className={`font-body text-sm block transition-colors ${
                      !category ? "text-crimson" : "text-white/40 hover:text-white"
                    }`}
                  >
                    Todas
                  </Link>
                </li>
                {allCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.id}${gender ? `&gender=${gender}` : ""}`}
                      className={`font-body text-sm block transition-colors ${
                        category === cat.id
                          ? "text-crimson"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Grid productos */}
        <div className="flex-1">
          {/* Search */}
          <form method="GET" action="/products" className="mb-6">
            {gender && <input type="hidden" name="gender" value={gender} />}
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar productos..."
              className="w-full md:max-w-xs bg-white/5 border border-white/10 text-white font-body text-sm px-4 py-2 placeholder:text-white/20 focus:outline-none focus:border-crimson transition-colors"
            />
          </form>

          <Suspense fallback={<ProductGridSkeleton />}>
            {filteredProducts.length === 0 ? (
              <EmptyProducts />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Paginación */}
                {total_pages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: total_pages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/products?page=${p}${gender ? `&gender=${gender}` : ""}${category ? `&category=${category}` : ""}${q ? `&q=${q}` : ""}`}
                        className={`font-body text-xs w-9 h-9 flex items-center justify-center border transition-colors ${
                          currentPage === p
                            ? "border-crimson text-white bg-crimson/10"
                            : "border-white/10 text-white/40 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function EmptyProducts() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <span className="font-heading text-crimson/10 text-8xl tracking-widest" aria-hidden>BULL</span>
      <h2 className="text-white text-2xl">Sin productos aún</h2>
      <p className="font-body text-sm text-white/30 max-w-xs">
        Estamos cargando la colección. Vuelve pronto.
      </p>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border border-white/5 animate-pulse">
          <div className="aspect-[3/4] bg-white/5" />
          <div className="p-4 space-y-2">
            <div className="h-2 bg-white/5 w-1/2 rounded" />
            <div className="h-3 bg-white/5 w-3/4 rounded" />
            <div className="h-4 bg-white/5 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
