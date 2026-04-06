import { cn } from "@/utils/cn";

interface BullMarkProps {
  className?: string;
  /** Color del trazo. Default: white */
  color?: string;
  size?: number;
}

/**
 * Ícono de marca Bull Weightlifting.
 * Coloca tu SVG definitivo en /public/images/bull-mark.svg
 * y reemplaza este componente con un <Image> de Next.js.
 *
 * Actualmente renderiza un marcador de posición en SVG.
 */
export function BullMark({ className, color = "white", size = 80 }: BullMarkProps) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.75)}
      viewBox="0 0 120 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none", className)}
      aria-hidden="true"
    >
      {/* ── Ala izquierda: 3 líneas curvas de grosor decreciente ── */}
      <path d="M50 28 C40 20 24 14 10 8"  stroke={color} strokeWidth="2.8" strokeLinecap="round"/>
      <path d="M47 34 C36 26 20 20 6  15" stroke={color} strokeWidth="2"   strokeLinecap="round"/>
      <path d="M44 40 C33 33 18 27 4  23" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>

      {/* ── Ala derecha: espejo ── */}
      <path d="M70 28 C80 20 96 14 110 8"  stroke={color} strokeWidth="2.8" strokeLinecap="round"/>
      <path d="M73 34 C84 26 100 20 114 15" stroke={color} strokeWidth="2"   strokeLinecap="round"/>
      <path d="M76 40 C87 33 102 27 116 23" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>

      {/* ── Chevron central (V invertida) ── */}
      <path d="M50 28 L60 44 L70 28" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>

      {/* ── Vástago vertical ── */}
      <line x1="60" y1="44" x2="60" y2="57" stroke={color} strokeWidth="2.8" strokeLinecap="round"/>

      {/* ── Hocico / muzzle ── */}
      <ellipse cx="60" cy="68" rx="14" ry="10" stroke={color} strokeWidth="2.5"/>

      {/* ── Ollares ── */}
      <ellipse cx="54" cy="70" rx="3.5" ry="3" stroke={color} strokeWidth="1.8"/>
      <ellipse cx="66" cy="70" rx="3.5" ry="3" stroke={color} strokeWidth="1.8"/>
    </svg>
  );
}
