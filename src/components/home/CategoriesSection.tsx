"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Category } from "@/types";

gsap.registerPlugin(ScrollTrigger);

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

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cat-heading",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );

      gsap.fromTo(
        ".cat-card",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cat-grid",
            start: "top 70%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const items: Array<Partial<Category> & { placeholder?: boolean }> =
    categories.length > 0
      ? categories
      : [
          { id: "h", name: "Hombre", slug: "hombre", gender: "hombre", placeholder: true },
          { id: "m", name: "Mujer", slug: "mujer", gender: "mujer", placeholder: true },
          { id: "u", name: "Unisex", slug: "unisex", gender: "unisex", placeholder: true },
        ];

  return (
    <section ref={sectionRef} className="py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="cat-heading flex items-end justify-between mb-12">
          <div>
            {/* Eyebrow — Anantason */}
            <p className="font-anantason text-[10px] tracking-[0.6em] text-crimson uppercase mb-2">
              EXPLORA
            </p>
            {/* H2 — Bebas Neue (aplicado via globals.css + font-bebas por seguridad) */}
            <h2 className="font-bebas text-4xl md:text-5xl tracking-wider text-white">
              COLECCIONES
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 font-body text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors"
          >
            Ver todo
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        <div className="cat-grid grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((cat) => {
            const gradient = GENDER_GRADIENT[cat.gender ?? "unisex"] ?? "from-carbon to-background";

            return (
              <Link
                key={cat.id}
                href={`/products?gender=${cat.gender}`}
                className="cat-card group relative aspect-[3/4] overflow-hidden border border-white/5 hover:border-crimson/40 transition-colors"
              >
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
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
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {/* Gender label — Anantason */}
                  <p className="font-anantason text-[9px] tracking-[0.5em] text-crimson uppercase mb-1">
                    {GENDER_LABEL[cat.gender ?? "unisex"]?.toUpperCase()}
                  </p>
                  {/* Category name — Horizon Bull */}
                  <h3 className="font-heading text-2xl tracking-wider text-white uppercase">
                    {cat.name}
                  </h3>
                  {/* CTA — Arimo */}
                  <div className="flex items-center gap-1 mt-2 text-white/40 group-hover:text-white/80 transition-colors">
                    <span className="font-body text-xs tracking-widest uppercase">
                      Ver colección
                    </span>
                    <ArrowUpRight size={12} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile "Ver todo" */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/products"
            className="font-body text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors flex items-center gap-2"
          >
            Ver toda la colección
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
