import Link from "next/link";
import { ArrowRight, Scissors, Hash, Palette, CheckCircle } from "lucide-react";
import { getProductsByCategory } from "@/lib/queries/products";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personalización de Trusas",
  description: "Personaliza tu trusa con tu nombre, número y color de estampado.",
};

const STEPS = [
  {
    n: "01",
    icon: Scissors,
    title: "Elige tu trusa",
    desc: "Selecciona el modelo, color y talla que más te guste de nuestra colección.",
  },
  {
    n: "02",
    icon: Hash,
    title: "Agrega tu nombre y número",
    desc: "En la página del producto verás la sección de personalización. Escribe tu nombre (máx. 16 caracteres) y número (0–999).",
  },
  {
    n: "03",
    icon: Palette,
    title: "Selecciona el color del estampado",
    desc: "Elige entre blanco, negro, rojo, dorado o plateado para el estampado.",
  },
  {
    n: "04",
    icon: CheckCircle,
    title: "Agrega al carrito",
    desc: "Tu personalización queda guardada en el carrito. La verás reflejada en tu orden.",
  },
];

const PRINT_COLORS = [
  { label: "Blanco",   hex: "#FFFFFF", border: "#FFFFFF33" },
  { label: "Negro",    hex: "#111111", border: "#FFFFFF22" },
  { label: "Rojo",     hex: "#DC2626", border: "#DC262644" },
  { label: "Dorado",   hex: "#D97706", border: "#D9770644" },
  { label: "Plateado", hex: "#9CA3AF", border: "#9CA3AF44" },
];

export default async function PersonalizacionPage() {
  const products = await getProductsByCategory("trusas").catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-20">

      {/* Hero */}
      <div className="border-b border-white/5 pb-12">
        <p className="font-impact text-[10px] tracking-[0.6em] text-crimson uppercase mb-2">
          Bull Weightlifting
        </p>
        <h1 className="text-5xl md:text-7xl text-white leading-none mb-6">
          PERSONALIZA<br />TU TRUSA
        </h1>
        <p className="font-body text-sm text-white/40 max-w-xl leading-relaxed mb-8">
          Hazla completamente tuya. Estampa tu nombre, número y elige el color del estampado en cualquier trusa de nuestra colección. Sin costo adicional.
        </p>
        <Link
          href="#trusas"
          className="inline-flex items-center gap-3 bg-crimson hover:bg-crimson-light text-white font-heading text-xs tracking-widest uppercase px-6 py-3.5 transition-colors"
        >
          Ver trusas disponibles
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Cómo funciona */}
      <section className="space-y-8">
        <div>
          <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase mb-1">
            Proceso
          </p>
          <h2 className="text-3xl text-white">CÓMO FUNCIONA</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="border border-white/5 bg-white/[0.02] p-6 space-y-4 relative">
              <span className="font-bebas text-5xl text-white/5 absolute top-4 right-4 leading-none select-none">
                {n}
              </span>
              <div className="w-8 h-8 flex items-center justify-center border border-crimson/20 bg-crimson/10">
                <Icon size={14} className="text-crimson" />
              </div>
              <h3 className="font-heading text-sm text-white tracking-wider">
                {title.toUpperCase()}
              </h3>
              <p className="font-body text-xs text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Colores disponibles */}
      <section className="space-y-6">
        <div>
          <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase mb-1">
            Estampado
          </p>
          <h2 className="text-3xl text-white">COLORES DISPONIBLES</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          {PRINT_COLORS.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-3 border border-white/10 px-4 py-3"
            >
              <span
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: c.hex, borderColor: c.border }}
              />
              <span className="font-body text-sm text-white/60">{c.label}</span>
            </div>
          ))}
        </div>
        <p className="font-body text-xs text-white/25 italic">
          * El color del estampado se elige directamente en la página del producto.
        </p>
      </section>

      {/* Trusas disponibles */}
      <section id="trusas" className="space-y-8">
        <div>
          <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase mb-1">
            Colección
          </p>
          <h2 className="text-3xl text-white">TRUSAS PERSONALIZABLES</h2>
        </div>

        {products.length === 0 ? (
          <div className="border border-white/5 py-20 flex flex-col items-center gap-4 text-center">
            <span className="font-heading text-crimson/10 text-8xl select-none" aria-hidden>
              BULL
            </span>
            <p className="font-body text-sm text-white/30">
              Próximamente tendremos trusas disponibles para personalizar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
