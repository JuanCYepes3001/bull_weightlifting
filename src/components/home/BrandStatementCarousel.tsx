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

    const tl = gsap.timeline({
      onComplete: () => { animatingRef.current = false; },
    });

    tl.to(prevEl, { opacity: 0, duration: 0.35, ease: "power2.in" });
    tl.set(prevEl, { zIndex: 0 });
    tl.set(nextEl, { opacity: 0, zIndex: 1 });
    tl.to(nextEl, { opacity: 1, duration: 0.55, ease: "power2.out" }, "+=0.05");
    tl.to(
      textEls,
      { y: 0, opacity: 1, duration: 0.55, stagger: 0.12, ease: "power3.out" },
      "-=0.3"
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleNav = (next: number) => {
    transitionTo(next);
    resetTimer();
  };

  return (
    <section className="relative bg-[#111111] overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-crimson z-10" />

      {/*
        min-h-[62vh] on every slide guarantees identical section height across all slides.
        The image column fills that height minus py-12 padding → all images are exactly
        the same pixel height regardless of their intrinsic dimensions.
      */}
      <div className="grid">
        {SLIDES.map((slide, i) => {
          const img = getImage(i);
          const imageLeft = i % 2 === 1;

          return (
            <div
              key={i}
              ref={(el) => { slideEls.current[i] = el; }}
              className="col-start-1 row-start-1 flex min-h-[62vh]"
              style={{ opacity: 0, zIndex: 0 }}
            >
              {/* ── Text column ── */}
              <div
                className={`flex-1 flex items-center px-8 md:px-14 lg:px-20 py-16 ${
                  imageLeft ? "order-2" : "order-1"
                }`}
              >
                <div className={`w-full ${imageLeft ? "text-right" : "text-left"}`}>
                  <p
                    data-t
                    className="font-anantason text-[10px] tracking-[0.6em] text-crimson uppercase mb-10"
                  >
                    MANIFIESTO
                  </p>

                  <div className="space-y-1 overflow-hidden">
                    {slide.lines.map((line, j) => (
                      <p
                        key={j}
                        data-t
                        className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight text-white uppercase"
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  <p
                    data-t
                    className={`font-body text-sm text-white/50 leading-relaxed mt-10 max-w-xs ${
                      imageLeft ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    {slide.sub}
                  </p>
                </div>
              </div>

              {/* ── Image column ── */}
              <div
                className={`hidden md:flex flex-col flex-shrink-0 w-[42%] lg:w-[44%] py-10 md:py-14 ${
                  imageLeft ? "order-1" : "order-2"
                }`}
              >
                {img ? (
                  /* flex-1 fills the height set by py-10/14 padding above */
                  <div className="relative flex-1 overflow-hidden">
                    <Image
                      src={img}
                      alt={`Atleta ${i + 1}`}
                      fill
                      className="object-cover object-top"
                      priority={i === 0}
                      sizes="44vw"
                    />
                    {/* Soft edge fade toward the text column */}
                    <div
                      className={`absolute inset-y-0 w-20 ${
                        imageLeft
                          ? "right-0 bg-gradient-to-r from-transparent to-[#111111]"
                          : "left-0 bg-gradient-to-l from-transparent to-[#111111]"
                      }`}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev arrow */}
      <button
        onClick={() => handleNav((activeRef.current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors duration-200"
        aria-label="Anterior"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next arrow */}
      <button
        onClick={() => handleNav((activeRef.current + 1) % SLIDES.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors duration-200"
        aria-label="Siguiente"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Navigation dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
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

      <div className="absolute bottom-0 inset-x-0 h-px bg-crimson z-10" />
    </section>
  );
}
