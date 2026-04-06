"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/Button";
import { BullMark } from "@/components/ui/BullMark";

interface HeroSectionProps {
  isAuthenticated: boolean;
  userName?: string | null;
}

export function HeroSection({ isAuthenticated, userName }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      /* 1 · Ícono de marca baja desde arriba */
      tl.fromTo(
        ".hero-mark",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      );

      /* 2 · "BULL" sube — Horizon Bull, crimson */
      tl.fromTo(
        ".hero-bull",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        "-=0.2"
      );

      /* 3 · "WEIGHTLIFTING" sube — Anantason, blanco */
      tl.fromTo(
        ".hero-weightlifting",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.5"
      );

      /* 4 · Línea roja crece */
      tl.fromTo(
        ".hero-line",
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.5 },
        "-=0.4"
      );

      /* 5 · Tagline */
      tl.fromTo(
        ".hero-tagline",
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        "-=0.2"
      );

      /* 6 · CTAs */
      tl.fromTo(
        ".hero-cta",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        "-=0.3"
      );

      /* 7 · Scroll indicator */
      tl.fromTo(
        ".hero-scroll",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        "-=0.2"
      );

      /* Float en scroll indicator */
      gsap.to(".hero-scroll", {
        y: 8,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.5,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Fondo fantasma BULL (watermark) — Horizon Bull ── */}
      <span
        className="absolute select-none pointer-events-none font-heading text-[40vw] leading-none text-white/[0.015] tracking-widest top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        BULL
      </span>

      {/* ── Acento vertical izquierdo ── */}
      <div className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
        <div className="w-px h-20 bg-crimson/60" />
        <p
          className="font-anantason text-[9px] tracking-[0.5em] text-crimson/40 mt-6 whitespace-nowrap"
          style={{ writingMode: "vertical-rl" }}
        >
          COLOMBIA
        </p>
      </div>

      {/* ── Contenido principal ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">

        {/* Ícono de marca — reemplazar con SVG oficial */}
        <div className="hero-mark mb-4 md:mb-6">
          <BullMark size={72} />
        </div>

        {/* BULL — Horizon Bull, crimson, dominante */}
        <h1
          className="hero-bull font-heading text-crimson uppercase leading-none tracking-[0.08em]"
          style={{ fontSize: "clamp(5rem, 22vw, 18rem)" }}
        >
          BULL
        </h1>

        {/* WEIGHTLIFTING — Impact, blanco, grande y visible */}
        <p
          className="hero-weightlifting font-impact text-white uppercase tracking-[0.1em] -mt-2 md:-mt-4"
          style={{ fontSize: "clamp(1.4rem, 7.5vw, 7rem)" }}
        >
          WEIGHTLIFTING
        </p>

        {/* Línea roja separadora */}
        <div className="hero-line w-full max-w-xs md:max-w-md h-px bg-crimson mt-6 mb-4" />

        {/* Tagline — Arimo, cuerpo de texto */}
        <p className="hero-tagline font-body text-xs text-white/30 tracking-[0.3em] uppercase">
          El que para, pierde
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
          {isAuthenticated ? (
            <>
              <Link href="/products" className="hero-cta">
                <Button size="lg">Ver Colección</Button>
              </Link>
              <Link href="/profile/account" className="hero-cta">
                <Button size="lg" variant="ghost">
                  Hola, {userName?.split(" ")[0] ?? "atleta"}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/products" className="hero-cta">
                <Button size="lg">Ver Colección</Button>
              </Link>
              <Link href="/register" className="hero-cta">
                <Button size="lg" variant="secondary">
                  Crear cuenta
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Scroll indicator — Arimo ── */}
      <div className="hero-scroll absolute bottom-10 flex flex-col items-center gap-2 text-white/20">
        <ArrowDown size={16} />
        <p className="font-body text-[10px] tracking-widest uppercase">Scroll</p>
      </div>
    </section>
  );
}
