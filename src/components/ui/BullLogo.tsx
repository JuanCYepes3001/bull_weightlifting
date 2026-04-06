import Link from "next/link";
import { cn } from "@/utils/cn";
import { BullMark } from "./BullMark";

interface BullLogoProps {
  /**
   * sm  → navbar compacto
   * md  → navbar con subtítulo
   * lg  → footer
   * xl  → hero / landing
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * horizontal → [LOGO] [BULL / WEIGHTLIFTING]  (navbar)
   * stack      → BULL / WEIGHTLIFTING apilados   (footer, hero)
   */
  layout?: "horizontal" | "stack";
  /** Muestra "WEIGHTLIFTING" */
  withSubtitle?: boolean;
  /** Muestra el ícono de marca */
  withMark?: boolean;
  /** Activa animación GSAP en el ícono */
  animateMark?: boolean;
  asLink?: boolean;
  className?: string;
  /** Tamaño en px para el ícono (sobrescribe el calculado por `size`) */
  markSize?: number;
}

/* ── Escalas por tamaño ───────────────────────────────── */
const SIZE_MAP = {
  sm: { bull: "text-lg   tracking-[0.15em]", sub: "text-[8px]  tracking-[0.4em]",  mark: 24, gap: "gap-1.5" },
  md: { bull: "text-xl   tracking-[0.18em]", sub: "text-[9px]  tracking-[0.42em]", mark: 32, gap: "gap-2"   },
  lg: { bull: "text-4xl  tracking-[0.2em]",  sub: "text-[15px] tracking-[0.5em]",  mark: 52, gap: "gap-3"   },
  // XL reduzido para que el conjunto texto+marca sea más homogéneo
  xl: { bull: "text-5xl  tracking-[0.22em]", sub: "text-[20px] tracking-[0.5em]", mark: 96, gap: "gap-4"   },
};

function LogoContent({
  size = "md",
  layout = "stack",
  withSubtitle = true,
  withMark = false,
  animateMark = false,
  markSize,
  className,
}: Omit<BullLogoProps, "asLink">) {
  const s = SIZE_MAP[size];
  const isHorizontal = layout === "horizontal";

  return (
    <span
      className={cn(
        "inline-flex leading-none select-none",
        isHorizontal
          ? `flex-row items-center ${s.gap}`
          : "flex-col items-center",
        className
      )}
    >
      {/* ── Ícono de marca ─────────────────────────────── */}
      {withMark && (
        <BullMark
          size={markSize ?? s.mark}
          animate={animateMark}
          className={isHorizontal ? "" : "mb-2"}
        />
      )}

      {/* ── Texto ──────────────────────────────────────── */}
      <span className={cn("inline-flex leading-none", isHorizontal ? "flex-col items-start" : "flex-col items-center")}>
        {/* BULL — Horizon Bull, crimson */}
        <span
          className={cn(
            "font-heading text-crimson uppercase block",
            s.bull
          )}
        >
          BULL
        </span>

        {/* WEIGHTLIFTING — Impact, blanco */}
        {withSubtitle && (
          <span
            className={cn(
              "font-impact text-white uppercase block",
              isHorizontal ? "-mt-0.5" : "-mt-1",
              s.sub
            )}
          >
            WEIGHTLIFTING
          </span>
        )}
      </span>
    </span>
  );
}

export function BullLogo({ asLink = true, ...props }: BullLogoProps) {
  if (asLink) {
    return (
      <Link
        href="/"
        className="hover:opacity-85 transition-opacity"
        aria-label="Bull Weightlifting — Inicio"
      >
        <LogoContent {...props} />
      </Link>
    );
  }
  return <LogoContent {...props} />;
}
