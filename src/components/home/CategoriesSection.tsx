"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Category } from "@/types";

gsap.registerPlugin(ScrollTrigger);

// Palette: bg gradient + accent color per card
const PALETTES = [
  { from: "#0d1b2a", to: "#0a1520", accent: "#3b82f6", label: "Azul" },
  { from: "#1a0a0a", to: "#150808", accent: "#dc2626", label: "Rojo" },
  { from: "#0a1a0d", to: "#081510", accent: "#16a34a", label: "Verde" },
  { from: "#1a150a", to: "#150f08", accent: "#d97706", label: "Ámbar" },
  { from: "#150a1a", to: "#100815", accent: "#9333ea", label: "Violeta" },
  { from: "#0a1a1a", to: "#081515", accent: "#0891b2", label: "Cian" },
];

// Inline SVG art for each palette index (abstract geometric shapes)
const CARD_ART = [
  // Camiseta / ropa superior
  <svg key="0" viewBox="0 0 200 220" className="absolute inset-0 w-full h-full opacity-20" fill="none">
    <path d="M60 30 L30 60 L50 70 L50 180 L150 180 L150 70 L170 60 L140 30 L120 50 C115 65 85 65 80 50 Z" stroke="currentColor" strokeWidth="3" fill="none"/>
    <circle cx="100" cy="95" r="15" stroke="currentColor" strokeWidth="2" />
    <line x1="50" y1="100" x2="150" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/>
  </svg>,
  // Pantalón / ropa inferior
  <svg key="1" viewBox="0 0 200 220" className="absolute inset-0 w-full h-full opacity-20" fill="none">
    <path d="M50 40 L50 130 L80 180 L100 130 L120 180 L150 130 L150 40 Z" stroke="currentColor" strokeWidth="3" fill="none"/>
    <line x1="100" y1="40" x2="100" y2="130" stroke="currentColor" strokeWidth="2"/>
    <rect x="50" y="40" width="100" height="20" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>,
  // Accesorios
  <svg key="2" viewBox="0 0 200 220" className="absolute inset-0 w-full h-full opacity-20" fill="none">
    <circle cx="100" cy="90" r="45" stroke="currentColor" strokeWidth="3"/>
    <circle cx="100" cy="90" r="25" stroke="currentColor" strokeWidth="2"/>
    <path d="M100 45 L100 20 M155 90 L180 90 M100 135 L100 160 M45 90 L20 90" stroke="currentColor" strokeWidth="2"/>
    <circle cx="100" cy="90" r="8" fill="currentColor" opacity="0.4"/>
  </svg>,
  // Zapatos / calzado
  <svg key="3" viewBox="0 0 200 220" className="absolute inset-0 w-full h-full opacity-20" fill="none">
    <path d="M30 140 C30 140 50 100 80 95 L130 90 C150 88 170 100 175 120 C180 140 165 155 140 155 L40 155 C33 155 28 148 30 140 Z" stroke="currentColor" strokeWidth="3" fill="none"/>
    <path d="M80 95 L75 60 C75 55 80 50 85 50 L105 50 C110 50 115 55 115 60 L115 90" stroke="currentColor" strokeWidth="3" fill="none"/>
    <line x1="90" y1="120" x2="160" y2="115" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 3"/>
  </svg>,
  // Hoodie / sudadera
  <svg key="4" viewBox="0 0 200 220" className="absolute inset-0 w-full h-full opacity-20" fill="none">
    <path d="M70 30 L40 55 L30 90 L55 95 L55 185 L145 185 L145 95 L170 90 L160 55 L130 30 L115 50 L100 60 L85 50 Z" stroke="currentColor" strokeWidth="3" fill="none"/>
    <path d="M85 50 Q100 70 115 50" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="85" y="130" width="30" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>,
  // Gorra / headwear
  <svg key="5" viewBox="0 0 200 220" className="absolute inset-0 w-full h-full opacity-20" fill="none">
    <path d="M40 110 Q40 60 100 55 Q160 60 160 110 Z" stroke="currentColor" strokeWidth="3" fill="none"/>
    <path d="M30 110 L170 110 L155 125 L45 125 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <line x1="40" y1="110" x2="160" y2="110" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="100" cy="57" r="6" stroke="currentColor" strokeWidth="2"/>
  </svg>,
];

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);

  const items: Array<Partial<Category> & { placeholder?: boolean }> =
    categories.length > 0
      ? categories
      : [
          { id: "1", name: "Camisetas",   slug: "camisetas",   gender: "unisex", placeholder: true },
          { id: "2", name: "Pantalones",  slug: "pantalones",  gender: "hombre", placeholder: true },
          { id: "3", name: "Accesorios",  slug: "accesorios",  gender: "unisex", placeholder: true },
          { id: "4", name: "Calzado",     slug: "calzado",     gender: "unisex", placeholder: true },
          { id: "5", name: "Sudaderas",   slug: "sudaderas",   gender: "unisex", placeholder: true },
          { id: "6", name: "Gorras",      slug: "gorras",      gender: "unisex", placeholder: true },
        ];

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track   = trackRef.current;
    const heading = headingRef.current;
    if (!wrapper || !track || !heading) return;

    const ctx = gsap.context(() => {
      // Heading fade-in
      gsap.fromTo(
        heading,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: wrapper, start: "top 75%" },
        }
      );

      // Cards stagger on first appear
      gsap.fromTo(
        ".cat-card",
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: track, start: "top 80%" },
        }
      );

      // Horizontal scroll: pin section, translate track.
      // getScrollDistance = how far the track must move so its right edge aligns with viewport right.
      // track.getBoundingClientRect().left accounts for the container's padding offset.
      const getScrollDistance = () => {
        const trackLeft = track.getBoundingClientRect().left;
        return Math.max(0, track.scrollWidth + trackLeft - window.innerWidth);
      };

      const anim = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        duration: 1,
      });

      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: () => `+=${getScrollDistance()}`,
        pin: true,
        anticipatePin: 1,
        scrub: 1.2,
        animation: anim,
        invalidateOnRefresh: true,
        onRefresh: () => anim.invalidate(),
      });
    }, wrapper);

    return () => ctx.revert();
  }, [items.length]);

  return (
    <div ref={wrapperRef} className="bg-background">
      <div ref={sectionRef} className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div ref={headingRef} className="flex items-end justify-between mb-10">
            <div>
              <p className="font-anantason text-[10px] tracking-[0.6em] text-crimson uppercase mb-2">
                EXPLORA
              </p>
              <h2 className="font-bebas text-4xl md:text-5xl tracking-wider text-white">
                CATEGORÍAS
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

          {/* Horizontal track */}
          <div
            ref={trackRef}
            className="flex gap-5 will-change-transform"
            style={{ width: "max-content" }}
          >
            {items.map((cat, i) => {
              const palette = PALETTES[i % PALETTES.length];
              const art     = CARD_ART[i % CARD_ART.length];

              return (
                <Link
                  key={cat.id}
                  href={cat.placeholder ? `/products?q=${cat.slug}` : `/products?category=${cat.id}`}
                  className="cat-card group relative flex-shrink-0 w-64 md:w-72 h-[420px] md:h-[480px] overflow-hidden border border-white/5 hover:border-white/20 transition-colors duration-300"
                  style={{ background: `linear-gradient(160deg, ${palette.from}, ${palette.to})` }}
                >
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name ?? ""}
                      fill
                      sizes="288px"
                      className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ color: palette.accent }}
                    >
                      {art}
                    </div>
                  )}

                  {/* Glow top-right */}
                  <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40"
                    style={{ background: palette.accent }}
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Bottom reveal line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{ background: palette.accent }}
                  />

                  {/* Accent pill top-left */}
                  <div
                    className="absolute top-5 left-5 px-3 py-1 text-[9px] font-body tracking-[0.3em] uppercase"
                    style={{ background: `${palette.accent}22`, color: palette.accent, border: `1px solid ${palette.accent}44` }}
                  >
                    {palette.label}
                  </div>

                  {/* Card content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-heading text-2xl tracking-wider text-white uppercase mb-2">
                      {cat.name}
                    </h3>
                    <div
                      className="flex items-center gap-1 text-white/40 group-hover:text-white/80 transition-colors"
                    >
                      <span className="font-body text-xs tracking-widest uppercase">
                        Ver categoría
                      </span>
                      <ArrowUpRight size={12} />
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* End spacer card */}
            <div className="flex-shrink-0 w-16 md:w-24" />
          </div>

          {/* Mobile "Ver todo" */}
          <div className="mt-8 flex justify-center md:hidden">
            <Link
              href="/products"
              className="font-body text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors flex items-center gap-2"
            >
              Ver todas las categorías
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
