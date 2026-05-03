"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";

const SLIDES = [
  {
    lines: ["No entrenas para verte bien.", "Entrenas para ser imparable."],
    sub: "Cada pieza diseñada para acompañarte — desde el primer rep hasta el último.",
  },
  {
    lines: ["El dolor de hoy", "es la fuerza de mañana."],
    sub: "Sin excusas. Sin límites. Solo resultados.",
  },
  {
    lines: ["No se trata de llegar primero.", "Se trata de no rendirse."],
    sub: "Equipado para quienes no paran.",
  },
  {
    lines: ["La disciplina", "supera al talento."],
    sub: "Entrena como si dependiera de ti. Porque depende de ti.",
  },
  {
    lines: ["El que aguanta,", "gana."],
    sub: "El éxito se construye rep a rep.",
  },
];

interface Props {
  imageUrls: string[];
}

export function BrandStatementCarousel({ imageUrls }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef(0);
  const animatingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideEls = useRef<(HTMLDivElement | null)[]>([]);

  const getImage = (i: number) =>
    imageUrls.length ? imageUrls[i % imageUrls.length] : null;

  const transitionTo = useCallback((next: number) => {
    if (animatingRef.current || next === activeRef.current) return;
    animatingRef.current = true;

    const prev = activeRef.current;
    activeRef.current = next;
    setActiveIndex(next);

    const prevEl = slideEls.current[prev];
    const nextEl = slideEls.current[next];

    if (!prevEl || !nextEl) {
      animatingRef.current = false;
      return;
    }

    const textEls = Array.from(nextEl.querySelectorAll("[data-t]"));
    gsap.set(textEls, { y: 24, opacity: 0 });
    gsap.set(nextEl, { opacity: 0, zIndex: 2 });
    gsap.set(prevEl, { zIndex: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(prevEl, { opacity: 0, zIndex: 0 });
        gsap.set(nextEl, { zIndex: 1 });
        animatingRef.current = false;
      },
    });

    tl.to(nextEl, { opacity: 1, duration: 0.9, ease: "power2.inOut" });
    tl.to(
      textEls,
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out" },
      "-=0.45"
    );
  }, []);

  const advance = useCallback(() => {
    transitionTo((activeRef.current + 1) % SLIDES.length);
  }, [transitionTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, 6000);
  }, [advance]);

  useEffect(() => {
    slideEls.current.forEach((el, i) => {
      if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 1 : 0 });
    });

    const firstEl = slideEls.current[0];
    if (firstEl) {
      const textEls = Array.from(firstEl.querySelectorAll("[data-t]"));
      gsap.fromTo(
        textEls,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.3 }
      );
    }

    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleNav = (next: number) => {
    transitionTo(next);
    resetTimer();
  };

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-[#111111]">
      <div className="absolute top-0 inset-x-0 h-px bg-crimson z-20" />

      {SLIDES.map((slide, i) => {
        const img = getImage(i);
        return (
          <div
            key={i}
            ref={(el) => { slideEls.current[i] = el; }}
            className="absolute inset-0"
            style={{ opacity: 0, zIndex: 0 }}
          >
            {img && (
              <Image
                src={img}
                alt={`Atleta ${i + 1}`}
                fill
                className="object-cover object-center"
                priority={i === 0}
                sizes="100vw"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

            <div className="relative z-10 h-full flex items-center px-4 md:px-8 lg:px-16">
              <div className="max-w-4xl w-full py-32">
                <p
                  data-t
                  className="font-anantason text-[10px] tracking-[0.6em] text-crimson uppercase mb-10"
                >
                  MANIFIESTO
                </p>
                <div className="space-y-2 overflow-hidden">
                  {slide.lines.map((line, j) => (
                    <p
                      key={j}
                      data-t
                      className="font-heading text-4xl md:text-6xl lg:text-7xl leading-tight text-white uppercase"
                    >
                      {line}
                    </p>
                  ))}
                </div>
                <p
                  data-t
                  className="font-body text-sm text-white/50 leading-relaxed max-w-md mt-10"
                >
                  {slide.sub}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev */}
      <button
        onClick={() => handleNav((activeRef.current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors duration-200"
        aria-label="Anterior"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next */}
      <button
        onClick={() => handleNav((activeRef.current + 1) % SLIDES.length)}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors duration-200"
        aria-label="Siguiente"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-4 md:left-16 z-30 flex items-center gap-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleNav(i)}
            aria-label={`Slide ${i + 1}`}
            className={`block h-px transition-all duration-300 ${
              i === activeIndex
                ? "w-10 bg-crimson"
                : "w-5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-crimson z-20" />
    </section>
  );
}
