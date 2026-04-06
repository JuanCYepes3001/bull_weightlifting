"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";

gsap.registerPlugin(ScrollTrigger);

interface FeaturedCTAProps {
  isAuthenticated?: boolean;
}

export function FeaturedCTA({ isAuthenticated = false }: FeaturedCTAProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
        },
        defaults: { ease: "power3.out" },
      });

      tl.fromTo(
        ".fcta-label",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
        .fromTo(
          ".fcta-title",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.2"
        )
        .fromTo(
          ".fcta-sub",
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          ".fcta-btn",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          "-=0.3"
        );

      gsap.fromTo(
        ".fcta-line",
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-4 md:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-background" />

      {/* Background watermark — Horizon Bull */}
      <span
        className="absolute right-0 bottom-0 select-none pointer-events-none font-heading text-[20vw] leading-none text-white/[0.015] tracking-widest"
        aria-hidden="true"
      >
        BULL
      </span>

      <div className="fcta-line absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-crimson to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Eyebrow — Anantason */}
        <p className="fcta-label font-anantason text-[10px] tracking-[0.6em] text-crimson uppercase mb-4">
          COLECCIÓN DISPONIBLE
        </p>

        {/* H2 — Bebas Neue para la intro, Horizon Bull domina en BULL */}
        <h2 className="fcta-title font-bebas text-5xl md:text-7xl lg:text-8xl tracking-wider text-white leading-tight">
          EMPIEZA TU
          <br />
          <span className="font-heading text-crimson">JOURNEY</span>
        </h2>

        {/* Description — Arimo */}
        <p className="fcta-sub font-body text-sm text-white/30 leading-relaxed max-w-sm mt-6">
          Equípate con ropa que aguanta tanto como tú. Sin compromisos, sin
          límites.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/products" className="fcta-btn">
            <Button size="lg">Ver Colección</Button>
          </Link>
          {!isAuthenticated && (
            <Link href="/register" className="fcta-btn">
              <Button size="lg" variant="secondary">
                Crear cuenta gratis
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
