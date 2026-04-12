import Link from "next/link";
import { ArrowRight, Scissors, Hash, Palette } from "lucide-react";

const features = [
  {
    icon: Scissors,
    title: "Tu nombre",
    desc: "Estampa tu nombre o el de quien quieras en la prenda.",
  },
  {
    icon: Hash,
    title: "Tu número",
    desc: "Elige el número que te identifica. Del 0 al 999.",
  },
  {
    icon: Palette,
    title: "Tu color",
    desc: "Selecciona el color del estampado: blanco, negro, rojo, dorado o plateado.",
  },
];

export function TrusasSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="font-impact text-[10px] tracking-[0.6em] text-crimson uppercase mb-2">
            Exclusivo Bull Weightlifting
          </p>
          <h2 className="text-4xl md:text-5xl text-white leading-none mb-4">
            PERSONALIZA TU TRUSA
          </h2>
          <p className="font-body text-sm text-white/40 max-w-lg leading-relaxed">
            Hazla tuya. Agrega tu nombre, número y color de estampado a cualquier trusa de nuestra colección.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="border border-white/5 bg-white/[0.02] p-6 space-y-3 hover:border-crimson/20 hover:bg-crimson/[0.03] transition-colors"
            >
              <div className="w-8 h-8 flex items-center justify-center border border-crimson/20 bg-crimson/10">
                <Icon size={14} className="text-crimson" />
              </div>
              <h3 className="font-heading text-base text-white tracking-wider">
                {title.toUpperCase()}
              </h3>
              <p className="font-body text-xs text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/personalizacion"
            className="inline-flex items-center gap-3 bg-crimson hover:bg-crimson-light text-white font-heading text-xs tracking-widest uppercase px-6 py-3.5 transition-colors"
          >
            Personalizar ahora
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/products?category=trusas"
            className="inline-flex items-center gap-2 font-body text-xs tracking-widest uppercase text-white/30 hover:text-white transition-colors"
          >
            Ver todas las trusas →
          </Link>
        </div>
      </div>
    </section>
  );
}
