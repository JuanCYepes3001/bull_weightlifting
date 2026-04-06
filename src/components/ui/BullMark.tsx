"use client";

import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { cn } from "@/utils/cn";

interface BullMarkProps {
  className?: string;
  /** Tamaño en px (se aplica a width y height del contenedor) */
  size?: number;
  /** Activa animación GSAP hover */
  animate?: boolean;
}

/**
 * Ícono de marca Bull Weightlifting.
 * Carga /public/images/bull-logo.png (o .svg / .webp).
 * Si no existe, muestra el SVG placeholder de respaldo.
 */
export function BullMark({ className, size = 80, animate = false }: BullMarkProps) {
  const [imgError, setImgError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || !containerRef.current) return;
    const el = containerRef.current;

    const onEnter = () =>
      gsap.to(el, {
        scale: 1.08,
        rotate: -4,
        duration: 0.35,
        ease: "power2.out",
      });
    const onLeave = () =>
      gsap.to(el, {
        scale: 1,
        rotate: 0,
        duration: 0.4,
        ease: "elastic.out(1, 0.5)",
      });

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [animate]);

  return (
    <div
      ref={containerRef}
      className={cn("relative select-none flex-shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {!imgError ? (
        <Image
          src="/images/bull-logo.png"
          alt=""
          fill
          className="object-contain"
          onError={() => setImgError(true)}
          priority
          unoptimized
        />
      ) : (
        /* ── SVG placeholder de respaldo ─────────────────── */
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Alas izquierda */}
          <path d="M50 38 C40 28 24 20 10 12" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
          <path d="M47 44 C36 34 20 28 6 22"  stroke="white" strokeWidth="2"   strokeLinecap="round"/>
          <path d="M44 50 C33 41 18 35 4 30"  stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
          {/* Alas derecha */}
          <path d="M70 38 C80 28 96 20 110 12"  stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
          <path d="M73 44 C84 34 100 28 114 22" stroke="white" strokeWidth="2"   strokeLinecap="round"/>
          <path d="M76 50 C87 41 102 35 116 30" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
          {/* Chevron */}
          <path d="M50 38 L60 56 L70 38" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Vástago */}
          <line x1="60" y1="56" x2="60" y2="70" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
          {/* Hocico */}
          <ellipse cx="60" cy="82" rx="14" ry="10" stroke="white" strokeWidth="2.5"/>
          {/* Ollares */}
          <ellipse cx="54" cy="84" rx="3.5" ry="3" stroke="white" strokeWidth="1.8"/>
          <ellipse cx="66" cy="84" rx="3.5" ry="3" stroke="white" strokeWidth="1.8"/>
        </svg>
      )}
    </div>
  );
}
