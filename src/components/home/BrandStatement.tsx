"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MANIFESTO_LINES = [
  "No entrenas para verte bien.",
  "Entrenas para ser imparable.",
];

export function BrandStatement() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      /* Red line grows */
      gsap.fromTo(
        ".bs-line",
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );

      /* Label fades up — Anantason */
      gsap.fromTo(
        ".bs-label",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
          },
        }
      );

      /* Manifesto lines stagger — Horizon Bull */
      gsap.fromTo(
        ".bs-line-text",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.18,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        }
      );

      /* Sub-text — Arimo */
      gsap.fromTo(
        ".bs-sub",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 50%",
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
      <div className="absolute inset-0 bg-[#111111]" />

      {/* Red borders */}
      <div className="bs-line absolute top-0 left-0 right-0 h-px bg-crimson" />

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Eyebrow — Anantason (complemento de marca) */}
        <p className="bs-label font-anantason text-[10px] tracking-[0.6em] text-crimson uppercase mb-10">
          MANIFIESTO
        </p>

        {/* Headlines — Horizon Bull */}
        <div className="space-y-3 overflow-hidden">
          {MANIFESTO_LINES.map((line, i) => (
            <p
              key={i}
              className="bs-line-text font-heading text-4xl md:text-6xl lg:text-7xl leading-tight text-white uppercase"
            >
              {line}
            </p>
          ))}
        </div>

        {/* Description — Arimo */}
        <p className="bs-sub font-body text-sm text-white/30 leading-relaxed max-w-md mt-10">
          Cada pieza está diseñada para acompañarte en el proceso — desde el
          primer rep hasta el último. Sin excusas. Sin límites.
        </p>
      </div>

      <div className="bs-line absolute bottom-0 left-0 right-0 h-px bg-crimson" />
    </section>
  );
}
