import Link from "next/link";
import { cn } from "@/utils/cn";
import { BullMark } from "./BullMark";

interface BullLogoProps {
  /**
   * sm  → navbar horizontal compacto
   * md  → navbar con subtítulo
   * lg  → footer
   * xl  → hero / landing
   */
  size?: "sm" | "md" | "lg" | "xl";
  /** Muestra "WEIGHTLIFTING" debajo de BULL */
  withSubtitle?: boolean;
  /** Muestra el ícono de marca sobre el texto */
  withMark?: boolean;
  asLink?: boolean;
  className?: string;
}

/* ── Escala por tamaño ─────────────────────────────────── */
const SIZE_MAP = {
  //            BULL text              WEIGHTLIFTING text     mark px
  sm: { bull: "text-xl  tracking-[0.15em]", sub: "text-[9px]  tracking-[0.4em]",  mark: 28 },
  md: { bull: "text-2xl tracking-[0.18em]", sub: "text-[11px] tracking-[0.45em]", mark: 36 },
  lg: { bull: "text-4xl tracking-[0.2em]",  sub: "text-[15px] tracking-[0.5em]",  mark: 52 },
  xl: { bull: "text-7xl tracking-[0.22em]", sub: "text-[26px] tracking-[0.55em]", mark: 80 },
};

function LogoContent({
  size = "md",
  withSubtitle = true,
  withMark = false,
  className,
}: Omit<BullLogoProps, "asLink">) {
  const s = SIZE_MAP[size];

  return (
    <span
      className={cn(
        "inline-flex flex-col items-center leading-none select-none",
        className
      )}
    >
      {/* Ícono de marca (opcional) */}
      {withMark && (
        <BullMark size={s.mark} className="mb-2" />
      )}

      {/* BULL — Horizon Bull, crimson */}
      <span
        className={cn(
          "font-heading text-crimson uppercase block",
          s.bull
        )}
      >
        BULL
      </span>

      {/* WEIGHTLIFTING — Impact, blanco, prominente */}
      {withSubtitle && (
        <span
          className={cn(
            "font-impact text-white uppercase block -mt-1",
            s.sub
          )}
        >
          WEIGHTLIFTING
        </span>
      )}
    </span>
  );
}

export function BullLogo({ asLink = true, ...props }: BullLogoProps) {
  if (asLink) {
    return (
      <Link
        href="/"
        className="hover:opacity-80 transition-opacity"
        aria-label="Bull Weightlifting — Inicio"
      >
        <LogoContent {...props} />
      </Link>
    );
  }
  return <LogoContent {...props} />;
}
