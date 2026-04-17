import type { NextConfig } from "next";

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

export default nextConfig;
