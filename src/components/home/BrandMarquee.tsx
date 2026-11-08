const PHRASES = ["El que para, pierde", "Bull Weightlifting", "Hecho para levantar"];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {[...PHRASES, ...PHRASES].map((phrase, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 md:px-10">{phrase}</span>
          <span className="h-1 w-1 rounded-full bg-crimson/70" />
        </span>
      ))}
    </div>
  );
}

// Separador discreto entre el hero y "Lo más vendido": texto pequeño y tenue,
// movimiento lento, se pausa al pasar el mouse y queda quieto con
// prefers-reduced-motion.
export function BrandMarquee() {
  return (
    <div
      className="overflow-hidden border-y border-white/5 bg-[#0D0D0D] py-4"
      aria-hidden="true"
    >
      <div className="flex w-max motion-safe:animate-marquee hover:[animation-play-state:paused] font-anantason text-[10px] md:text-xs uppercase tracking-[0.5em] text-white/25">
        <Row />
        <Row />
      </div>
    </div>
  );
}
