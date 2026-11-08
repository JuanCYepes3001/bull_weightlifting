"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/Button";
import { BullMark } from "@/components/ui/BullMark";
import { cn } from "@/utils/cn";
import { HeroAthletes } from "./HeroAthletes";

interface HeroSectionProps {
  isAuthenticated: boolean;
  userName?: string | null;
  athleteImages?: string[];
}

export function HeroSection({ isAuthenticated, userName, athleteImages = [] }: HeroSectionProps) {
  const hasPhotos = athleteImages.length > 0;
  const heroRef = useRef<HTMLElement>(null);
  const bullRef = useRef<HTMLHeadingElement>(null);
  const weightRef = useRef<HTMLParagraphElement>(null);
  const [computedBullSize, setComputedBullSize] = useState<number | undefined>(undefined);
  const [computedMarkSize, setComputedMarkSize] = useState<number | undefined>(undefined);

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

  // Ajuste dinámico: hacer que BULL tenga el mismo ancho que WEIGHTLIFTING
  useEffect(() => {
    function fitBullToWeight() {
      const weightEl = weightRef.current;
      const bullEl = bullRef.current;
      if (!weightEl || !bullEl) return;

      const targetW = weightEl.offsetWidth;
      if (!targetW) return;

      // Binary search para fontSize en px que haga que el ancho del título BULL sea ~ targetW
      const el = bullEl;
      const min = 24; // px
      const max = 800; // px
      let low = min;
      let high = max;
      let best = low;

      // hacemos 10 iteraciones de búsqueda para ajustar rápidamente
      for (let i = 0; i < 10; i++) {
        const mid = Math.floor((low + high) / 2);
        el.style.fontSize = mid + "px";
        // fuerza reflow
        const w = el.offsetWidth;
        if (w <= targetW) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      // Guardamos computedBullSize para uso si es necesario
      setComputedBullSize(best);

      // Ajustar tamaño del mark: que sea grande y llamativo, proporción respecto al ancho objetivo.
      // Con fotos de fondo en celular se limita para no tapar al deportista.
      const maxMark = hasPhotos && window.innerWidth < 1024 ? 72 : 520;
      const mark = Math.min(maxMark, Math.max(56, Math.floor(targetW * 0.45)));
      setComputedMarkSize(mark);
    }

    // Ejecutar en el siguiente frame para asegurarnos de que el DOM esté listo
    const raf = requestAnimationFrame(fitBullToWeight);

    const ro = new ResizeObserver(() => fitBullToWeight());
    if (weightRef.current) ro.observe(weightRef.current);
    if (bullRef.current) ro.observe(bullRef.current);
    window.addEventListener("resize", fitBullToWeight);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", fitBullToWeight);
    };
  }, [hasPhotos]);

  return (
    <section
      ref={heroRef}
      className={cn(
        "relative min-h-[100svh] flex flex-col items-center overflow-hidden",
        // pt-20: el contenido nunca queda debajo del navbar fijo (celular horizontal)
        hasPhotos ? "justify-end pt-20 pb-20 lg:justify-center lg:pb-0" : "justify-center"
      )}
    >
      <HeroAthletes images={athleteImages} />

      {/* ── Fondo fantasma BULL (watermark) — Horizon Bull ── */}
      <span
        className="absolute select-none pointer-events-none font-heading text-[28vw] leading-none text-white/[0.015] tracking-widest top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
      <div
        className={cn(
          "relative z-10 flex flex-col items-center text-center px-4",
          hasPhotos && "w-full lg:w-[54%] lg:self-start [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]"
        )}
      >

        {/* Ícono de marca — reemplazar con SVG oficial */}
        {/* En pantallas muy bajas (celular horizontal) el ícono no cabe junto al resto */}
        <div className="hero-mark mb-4 md:mb-6 [@media(max-height:500px)]:hidden">
          <BullMark size={computedMarkSize ?? 140} />
        </div>

        {/* BULL — Horizon Bull, crimson, dominante */}
        <h1
          ref={bullRef}
          className="hero-bull font-heading text-crimson uppercase leading-none tracking-[0.08em]"
          style={computedBullSize ? { fontSize: computedBullSize + "px" } : { fontSize: "clamp(4rem, 18vw, 12rem)" }}
        >
          BULL
        </h1>

        {/* WEIGHTLIFTING — Impact, blanco, grande y visible */}
        <p
          ref={weightRef}
          className="hero-weightlifting font-impact text-white uppercase tracking-[0.1em] -mt-2 md:-mt-4"
          style={{ fontSize: "clamp(1.1rem, 6vw, 4.5rem)" }}
        >
          WEIGHTLIFTING
        </p>

        {/* Línea roja separadora */}
        <div className="hero-line w-full max-w-xs md:max-w-md h-px bg-crimson mt-6 mb-4" />

        {/* Tagline — Arimo, cuerpo de texto */}
        <p
          className={cn(
            "hero-tagline font-body text-xs tracking-[0.3em] uppercase",
            hasPhotos ? "text-white/60" : "text-white/30"
          )}
        >
          El que para, pierde
        </p>

        {/* CTAs */}
        <div
          className={cn(
            "flex flex-col sm:flex-row gap-4 items-center",
            hasPhotos ? "mt-6 lg:mt-10" : "mt-10"
          )}
        >
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
      <div
        className={cn(
          "hero-scroll absolute bottom-4 z-10 flex flex-col items-center gap-2",
          hasPhotos ? "text-white/40 lg:left-[27%] lg:-translate-x-1/2" : "text-white/20"
        )}
      >
        <ArrowDown size={16} />
        <p className="font-body text-[10px] tracking-widest uppercase">Scroll</p>
      </div>
    </section>
  );
}
