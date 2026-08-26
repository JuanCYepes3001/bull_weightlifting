import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BullLogo } from "@/components/ui/BullLogo";

const shopLinks = [
  { label: "Colección", href: "/products" },
  { label: "Hombre", href: "/products?gender=hombre" },
  { label: "Mujer", href: "/products?gender=mujer" },
  { label: "Unisex", href: "/products?gender=unisex" },
];

const legalLinks = [
  { label: "Términos", href: "/legal/terminos" },
  { label: "Privacidad", href: "/legal/privacidad" },
  { label: "Envíos", href: "/legal/envios" },
  { label: "Devoluciones", href: "/legal/devoluciones" },
];

const socialLinks = [
  { label: "Instagram", handle: "@bullweightlifting", href: "https://instagram.com/bullweightlifting" },
  { label: "TikTok", handle: "@bullweightlifting", href: "https://tiktok.com/@bullweightlifting" },
  { label: "Facebook", handle: "Bull Weightlifting", href: "https://facebook.com/bullweightlifting" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            <BullLogo size="lg" withSubtitle withMark className="mb-4" />
            <p className="font-body text-xs text-white/30 leading-relaxed max-w-[200px] mt-2">
              Ropa deportiva de alto rendimiento. Diseñada para quienes no se detienen.
            </p>
          </div>

          {/* Tienda */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-bebas text-sm tracking-[0.3em] text-white mb-4">
              TIENDA
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-xs text-white/40 hover:text-white transition-colors tracking-wide"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes sociales */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-bebas text-sm tracking-[0.3em] text-white mb-4">
              SÍGUENOS
            </h3>
            <ul className="space-y-4">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-0.5 items-center md:items-start"
                  >
                    <span className="font-body text-xs text-white/60 group-hover:text-white transition-colors tracking-wide flex items-center gap-1">
                      {s.label}
                      <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="font-body text-[10px] text-white/25 tracking-wide">
                      {s.handle}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-bebas text-sm tracking-[0.3em] text-white mb-4">
              CONTACTO
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contacto@bullweightlifting.com"
                  className="font-body text-xs text-white/40 hover:text-white transition-colors tracking-wide"
                >
                  contacto@bullweightlifting.com
                </a>
              </li>
            </ul>
            <div className="mt-8">
              <p className="font-impact text-[10px] tracking-[0.4em] text-crimson/60 uppercase">
                EL QUE PARA, PIERDE
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-white/20">
            © {new Date().getFullYear()} Bull Weightlifting. Todos los derechos reservados.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-xs text-white/20 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="font-body text-xs text-white/20">Colombia</p>
        </div>
      </div>
    </footer>
  );
}
