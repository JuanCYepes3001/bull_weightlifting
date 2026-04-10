"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import gsap from "gsap";
import { useUser } from "@/hooks/useUser";
import { logoutAction } from "@/app/actions/auth";
import { BullLogo } from "@/components/ui/BullLogo";
import { useCartStore } from "@/store/cartStore";
import { CartDrawer } from "@/components/shop/CartDrawer";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const [navMarkSize, setNavMarkSize] = useState<number | undefined>(undefined);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { user, profile, isAdmin } = useUser();
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const setCartOpen = useCartStore((s) => s.setIsOpen);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string) => {
    const [path, query] = href.split("?");
    if (path === "/") return pathname === "/";
    if (!pathname.startsWith(path)) return false;
    if (query) {
      const params = new URLSearchParams(query);
      for (const [k, v] of params.entries()) {
        if (searchParams.get(k) !== v) return false;
      }
      return true;
    }
    // /products without query: active only if no on_sale param
    if (path === "/products") return !searchParams.get("on_sale");
    return true;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 1.2 }
    );
  }, []);

  // Ajusta automáticamente el tamaño del mark para que ocupe el alto de la navbar
  useEffect(() => {
    function updateMarkSize() {
      if (!navRef.current) return setNavMarkSize(undefined);
      const h = navRef.current.clientHeight;
      // dejar un pequeño margen
      const size = Math.max(20, Math.floor(h * 0.9));
      setNavMarkSize(size);
    }

    updateMarkSize();
    window.addEventListener("resize", updateMarkSize);
    return () => window.removeEventListener("resize", updateMarkSize);
  }, []);

  useEffect(() => {
    if (!mobileMenuRef.current || !menuOpen) return;
    gsap.fromTo(
      mobileMenuRef.current,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }
    );
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const navLinks = [
    { label: "Inicio",     href: "/" },
    { label: "Categorías", href: "/products#categories" },
    { label: "Colección",  href: "/products" },
    { label: "Ofertas",    href: "/products?on_sale=true", isOferta: true },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <BullLogo
          size="md"
          layout="horizontal"
          withMark
          withSubtitle
          animateMark
          markSize={navMarkSize}
        />

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-body text-[10px] tracking-widest uppercase transition-colors ${
                  link.isOferta
                    ? active
                      ? "text-amber-300 font-bold"
                      : "text-amber-400 hover:text-amber-300 font-bold"
                    : active
                    ? "text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {link.label}
                {active && !link.isOferta && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-crimson" />
                )}
                {link.isOferta && (
                  <span className="ml-1.5 inline-block w-1 h-1 rounded-full bg-amber-400 align-middle animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-48 bg-white/5 border border-white/20 px-3 py-1.5 font-body text-xs text-white placeholder-white/30 focus:outline-none focus:border-crimson/60 transition-colors"
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              />
              <button type="submit" className="text-white/50 hover:text-white transition-colors" aria-label="Buscar">
                <Search size={15} />
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} className="text-white/30 hover:text-white transition-colors" aria-label="Cerrar búsqueda">
                <X size={15} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="text-white/50 hover:text-white transition-colors" aria-label="Buscar">
              <Search size={16} />
            </button>
          )}

          {/* Cart icon con badge */}
          <button onClick={() => setCartOpen(true)} className="relative text-white/50 hover:text-white transition-colors" aria-label="Carrito">
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-crimson text-white font-body text-[9px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link href="/admin/dashboard" className="font-impact text-xs tracking-widest uppercase text-crimson hover:text-crimson-light transition-colors">
                  Admin
                </Link>
              )}
              <Link href="/profile/account" className="font-body text-xs tracking-widest uppercase text-white/50 hover:text-white transition-colors">
                {profile?.name?.split(" ")[0] ?? "Mi cuenta"}
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="font-body text-xs tracking-widest uppercase text-white/30 hover:text-white/70 transition-colors">
                  Salir
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="font-body text-xs tracking-widest uppercase text-white/50 hover:text-white transition-colors">
                Ingresar
              </Link>
              <Link href="/register" className="font-body text-xs tracking-widest uppercase bg-crimson hover:bg-crimson-light text-white px-4 py-2 transition-colors">
                Crear cuenta
              </Link>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-4">
          <button onClick={() => setCartOpen(true)} className="relative text-white/50 hover:text-white transition-colors" aria-label="Carrito">
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-crimson text-white font-body text-[9px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>
          <button onClick={() => setMenuOpen((v) => !v)} className="text-white/50 hover:text-white transition-colors" aria-label="Menú">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <CartDrawer />

      {menuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-background/98 backdrop-blur-md border-t border-white/5 px-4 py-6 flex flex-col gap-5">
          {/* Mobile search */}
          <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="flex items-center gap-2 border border-white/10 px-3 py-2">
            <Search size={14} className="text-white/30 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos o categorías..."
              className="flex-1 bg-transparent font-body text-xs text-white placeholder-white/25 focus:outline-none"
            />
          </form>

          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`font-body text-sm tracking-widest uppercase transition-colors ${
                  link.isOferta
                    ? "text-amber-400 font-bold"
                    : active
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
                {link.isOferta && (
                  <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-amber-400 align-middle animate-pulse" />
                )}
              </Link>
            );
          })}
          <div className="border-t border-white/5 pt-5 flex flex-col gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} className="font-impact text-sm tracking-widest uppercase text-crimson">
                    Panel Admin
                  </Link>
                )}
                <Link href="/profile/account" onClick={() => setMenuOpen(false)} className="font-body text-sm tracking-widest uppercase text-white/60 hover:text-white transition-colors">
                  Mi cuenta
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="font-body text-sm tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors">
                    Cerrar sesión
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="font-body text-sm tracking-widest uppercase text-white/60 hover:text-white transition-colors">
                  Iniciar sesión
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="font-body text-sm tracking-widest uppercase text-white">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
