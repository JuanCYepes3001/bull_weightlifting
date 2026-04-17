import type { Metadata } from "next";
import { Bebas_Neue, Inter, Arimo } from "next/font/google";
import "./globals.css";
import { CartSyncProvider } from "@/components/CartSyncProvider";

/* ─── Google Fonts ────────────────────────────────────── */
const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter-gf",
  subsets: ["latin"],
  display: "swap",
});

const arimo = Arimo({
  variable: "--font-arimo-gf",
  subsets: ["latin"],
  display: "swap",
});

/* ─── Metadata ────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "Bull Weightlifting — El que para, pierde",
    template: "%s | Bull Weightlifting",
  },
  description:
    "Ropa deportiva de alto rendimiento. Diseñada para quienes no se detienen.",
  keywords: ["ropa deportiva", "weightlifting", "gym", "bull", "entrenamiento"],
  icons: {
    icon: "/images/bull-logo.png",
    shortcut: "/images/bull-logo.png",
    apple: "/images/bull-logo.png",
  },
  openGraph: {
    title: "Bull Weightlifting",
    description: "El que para, pierde.",
    type: "website",
    locale: "es_CO",
  },
};

/* ─── Root Layout ─────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bebasNeue.variable} ${inter.variable} ${arimo.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <CartSyncProvider />
        {children}
      </body>
    </html>
  );
}
