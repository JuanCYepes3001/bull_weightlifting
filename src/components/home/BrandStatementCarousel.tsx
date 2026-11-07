"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";

const PHRASES = [
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

const SWIPE_THRESHOLD_PX = 50;

interface Props {
  imageUrls: string[];
}

export function BrandStatementCarousel({ imageUrls }: Props) {
  // Una diapositiva por deportista: toda foto nueva del bucket aparece sola.
  // Las frases se repiten en ciclo si hay más fotos que frases.
  const slideCount = Math.max(PHRASES.length, imageUrls.length);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef(0);
  const animatingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideEls = useRef<(HTMLDivElement | null)[]>([]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Desfasado una foto respecto al hero, que arranca con la primera
  const imageIndex = (i: number) => (i + 1) % imageUrls.length;
  const getImage = (i: number) =>
    imageUrls.length ? imageUrls[imageIndex(i)] : null;

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
    transitionTo((activeRef.current + 1) % slideCount);
  }, [transitionTo, slideCount]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Solo gestos horizontales: el scroll vertical de la página no cambia de slide
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
    handleNav((activeRef.current + (dx < 0 ? 1 : -1) + slideCount) % slideCount);
  };

  return (
    <section
      className="relative bg-[#111111] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-0 inset-x-0 h-px bg-crimson z-10" />

      {/*
        Todas las diapositivas comparten la misma celda del grid: la sección toma
        la altura de la más alta, así no salta de tamaño al cambiar.
        Celular: foto arriba a todo el ancho, frase debajo.
        Escritorio (md+): foto y frase lado a lado, alternando el lado.
      */}
      <div className="grid">
        {Array.from({ length: slideCount }, (_, i) => {
          const phrase = PHRASES[i % PHRASES.length];
          const img = getImage(i);
          const imageLeft = i % 2 === 1;

          return (
            <div
              key={i}
              ref={(el) => { slideEls.current[i] = el; }}
              className="col-start-1 row-start-1 flex flex-col md:flex-row md:min-h-[62vh]"
              style={{ opacity: 0, zIndex: 0 }}
            >
              {/* ── Text column ── */}
              <div
                className={`flex-1 flex items-center px-6 md:px-14 lg:px-20 pt-8 pb-16 md:py-16 order-2 ${
                  imageLeft ? "md:order-2" : "md:order-1"
                }`}
              >
                <div className={`w-full text-left ${imageLeft ? "md:text-right" : ""}`}>
                  <p
                    data-t
                    className="font-anantason text-[10px] tracking-[0.6em] text-crimson uppercase mb-6 md:mb-10"
                  >
                    MANIFIESTO
                  </p>

                  <div className="space-y-1 overflow-hidden">
                    {phrase.lines.map((line, j) => (
                      <p
                        key={j}
                        data-t
                        className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight text-white uppercase"
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  <p
                    data-t
                    className={`font-body text-sm text-white/50 leading-relaxed mt-6 md:mt-10 max-w-xs ${
                      imageLeft ? "md:ml-auto" : ""
                    }`}
                  >
                    {phrase.sub}
                  </p>
                </div>
              </div>

              {/* ── Image column ── */}
              {img && (
                <div
                  className={`flex flex-col flex-shrink-0 w-full h-[55svh] order-1 md:h-auto md:w-[42%] lg:w-[44%] md:py-14 ${
                    imageLeft ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <div className="relative flex-1 overflow-hidden">
                    <Image
                      src={img}
                      alt={`Deportista Bull Weightlifting ${imageIndex(i) + 1}`}
                      fill
                      className="object-cover object-[center_30%]"
                      sizes="(max-width: 767px) 100vw, 44vw"
                    />
                    {/* Celular: fundido hacia la frase de abajo */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111111] to-transparent md:hidden" />
                    {/* Escritorio: fundido hacia la columna de texto */}
                    <div
                      className={`hidden md:block absolute inset-y-0 w-20 ${
                        imageLeft
                          ? "right-0 bg-gradient-to-r from-transparent to-[#111111]"
                          : "left-0 bg-gradient-to-l from-transparent to-[#111111]"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flechas: solo en pantallas medianas+; en celular se desliza con el dedo */}
      <button
        onClick={() => handleNav((activeRef.current - 1 + slideCount) % slideCount)}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center text-white/40 hover:text-white transition-colors duration-200"
        aria-label="Anterior"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => handleNav((activeRef.current + 1) % slideCount)}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center text-white/40 hover:text-white transition-colors duration-200"
        aria-label="Siguiente"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Navigation dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
        {Array.from({ length: slideCount }, (_, i) => (
          <button
            key={i}
            onClick={() => handleNav(i)}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === activeIndex}
            className="py-3 px-1"
          >
            <span
              className={`block h-px transition-all duration-300 ${
                i === activeIndex ? "w-10 bg-crimson" : "w-5 bg-white/30 hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-crimson z-10" />
    </section>
  );
}
