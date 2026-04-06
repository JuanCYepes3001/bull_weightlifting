import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getCategories } from "@/lib/queries/categories";
import type { Gender } from "@/types";

interface CategoriesPageProps {
  searchParams: Promise<{ gender?: string }>;
}

export const metadata = { title: "Categorías" };

const GENDER_LABEL: Record<string, string> = {
  hombre: "Hombre",
  mujer: "Mujer",
  unisex: "Unisex",
};

const GENDER_GRADIENT: Record<string, string> = {
  hombre: "from-[#1A0A08] to-background",
  mujer: "from-[#0A0A1A] to-background",
  unisex: "from-[#0A1A0A] to-background",
};

const genders: Array<{ value: Gender | "all"; label: string }> = [
  { value: "all", label: "Todo" },
  { value: "hombre", label: "Hombre" },
  { value: "mujer", label: "Mujer" },
  { value: "unisex", label: "Unisex" },
];

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { gender } = await searchParams;

  const categories = await getCategories(gender as Gender | undefined).catch(() => []);
  const activeGender = gender ?? "all";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase mb-1">
          BULL WEIGHTLIFTING
        </p>
        <h1 className="text-4xl md:text-6xl text-white">CATEGORÍAS</h1>
        {categories.length > 0 && (
          <p className="font-body text-xs text-white/30 mt-2">
            {categories.length} categoría{categories.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar filtros */}
        <aside className="md:w-48 shrink-0 space-y-8">
          <div>
            <h3 className="text-xs tracking-[0.3em] text-white mb-3">GÉNERO</h3>
            <ul className="space-y-2">
              {genders.map(({ value, label }) => {
                const href = value === "all" ? "/categories" : `/categories?gender=${value}`;
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
        </aside>

        {/* Grid categorías */}
        <div className="flex-1">
          {categories.length === 0 ? (
            <EmptyCategories />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const gradient =
                  GENDER_GRADIENT[cat.gender] ?? "from-carbon to-background";
                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    className="group relative aspect-[3/4] overflow-hidden border border-white/5 hover:border-crimson/40 transition-colors"
                  >
                    {cat.image_url ? (
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Bottom reveal line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-crimson scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    {/* Card content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                      <p className="font-impact text-[9px] tracking-[0.5em] text-crimson uppercase mb-1">
                        {GENDER_LABEL[cat.gender]?.toUpperCase()}
                      </p>
                      <h3 className="font-heading text-xl md:text-2xl tracking-wider text-white uppercase">
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-2 text-white/40 group-hover:text-white/80 transition-colors">
                        <span className="font-body text-xs tracking-widest uppercase">
                          Ver productos
                        </span>
                        <ArrowUpRight size={12} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyCategories() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <span className="font-heading text-crimson/10 text-8xl tracking-widest" aria-hidden>
        BULL
      </span>
      <h2 className="text-white text-2xl">Sin categorías aún</h2>
      <p className="font-body text-sm text-white/30 max-w-xs">
        Estamos organizando la colección. Vuelve pronto.
      </p>
    </div>
  );
}
