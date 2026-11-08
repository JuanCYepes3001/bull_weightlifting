"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";

const INTERVAL_MS = 5000;

interface HeroAthletesProps {
  images: string[];
}

// Fondo rotativo del hero. En celular ocupa toda la pantalla; en escritorio es
// un panel alto a la derecha (las fotos son verticales: a todo el ancho se
// recortarían cabeza y pies y se verían pixeladas).
export function HeroAthletes({ images }: HeroAthletesProps) {
  const [active, setActive] = useState(0);
  // Solo se montan la foto actual y la siguiente: el resto se carga a medida
  // que el carrusel avanza, para no pesar en la primera carga en datos móviles.
  const [mountedCount, setMountedCount] = useState(Math.min(images.length, 2));

  const goTo = (index: number) => {
    setActive(index);
    setMountedCount((n) => Math.min(images.length, Math.max(n, index + 2)));
  };

  useEffect(() => {
    if (images.length < 2) return;
    const timeout = setTimeout(() => {
      const next = (active + 1) % images.length;
      setActive(next);
      setMountedCount((n) => Math.min(images.length, Math.max(n, next + 2)));
    }, INTERVAL_MS);
    return () => clearTimeout(timeout);
  }, [active, images.length]);

  if (!images.length) return null;

  return (
    <>
      <div className="absolute inset-0 lg:left-auto lg:w-[46%]" aria-hidden="true">
        {images.slice(0, mountedCount).map((src, i) => (
          <div
            key={src}
            className={cn(
              "absolute inset-0 overflow-hidden transition-opacity duration-[1200ms] ease-in-out",
              i === active ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              sizes="(max-width: 1023px) 100vw, 46vw"
              className="object-cover object-[center_30%] motion-safe:animate-kenburns"
            />
          </div>
        ))}

        {/* Los degradados usan el color de fondo del body (#0D0D0D), no el negro puro,
            para que el fundido no deje un borde visible */}
        {/* Celular: degradado inferior para que el logo y los botones se lean */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/75 to-[#0D0D0D]/10 lg:hidden" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0D0D0D]/80 to-transparent lg:hidden" />

        {/* Escritorio: fundido del panel hacia el contenido */}
        <div className="absolute inset-y-0 left-0 w-56 bg-gradient-to-r from-[#0D0D0D] to-transparent hidden lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0D0D0D] to-transparent hidden lg:block" />
      </div>

      {images.length > 1 && (
        <div className="absolute z-20 top-20 right-4 lg:top-auto lg:right-auto lg:bottom-10 lg:left-[77%] lg:-translate-x-1/2 flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ver deportista ${i + 1}`}
              aria-current={i === active}
              className="py-2"
            >
              <span
                className={cn(
                  "block h-0.5 transition-all duration-300",
                  i === active ? "w-8 bg-crimson" : "w-4 bg-white/40 hover:bg-white/70"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
