import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { checkLegalDocuments } from "./scripts/check-legal-docs.cjs";

// Content-Security-Policy
// Note: 'unsafe-inline' is required for Next.js App Router (React hydration inline scripts).
// To remove it, implement nonce-based CSP — see https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.paypalobjects.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://source.unsplash.com https://www.paypal.com https://www.paypalobjects.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://api.mercadopago.com",
  "frame-src https://www.paypal.com https://www.sandbox.paypal.com https://www.mercadopago.com https://www.mercadopago.com.co https://www.mercadopago.com.ar",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Remove or adjust HSTS if you don't serve over HTTPS in all environments
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: ContentSecurityPolicy },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xagdkfvnyniwyykfbrke.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

// Guard: en producción, los documentos legales deben estar "vigente".
// Se restringe a la fase de build (no a `next start` / runtime del server)
// chequeando `phase`, que Next.js pasa siempre a esta función — así el
// guard nunca puede tumbar la app ya desplegada, solo el build.
export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    const { ok, errors } = checkLegalDocuments();
    if (!ok) {
      console.error("✗ Guard de documentos legales falló — build abortado:\n");
      errors.forEach((e) => console.error(`  - ${e}`));
      throw new Error(
        "Documentos legales no aprobados para producción. Ver detalle arriba."
      );
    }
  }
  return nextConfig;
}
