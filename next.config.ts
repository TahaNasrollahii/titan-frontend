import type { NextConfig } from "next";

// Same default as src/lib/api/client.ts. /media is proxied to wherever the API runs; deployed
// backends return absolute media URLs (Vercel Blob), so this only matters for relative ones.
// Using 127.0.0.1 instead of localhost avoids Node IPv6 connection issues to Django on Windows.
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
const API_ORIGIN = new URL(rawApiUrl).origin.replace("localhost", "127.0.0.1");

const isProd = process.env.NODE_ENV === "production";

// Content Security Policy: the single source for every route (the proxy no longer sets its own).
// The configured API is allowed even if it moves off the default host; plain-http APIs only in dev.
const API_SOURCES = Array.from(
  new Set(["https://titan-backend-taha.vercel.app", ...(API_ORIGIN.startsWith("https://") ? [API_ORIGIN] : [])]),
);
const DEV_API_SOURCES = isProd ? [] : ["http://localhost:8000", "http://127.0.0.1:8000"];

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  [
    "img-src 'self' data: blob:",
    ...API_SOURCES,
    "https://*.public.blob.vercel-storage.com https://cdn.zarinpal.com https://trustseal.enamad.ir",
    "https://fortnite-api.com https://*.fortnite-api.com https://cdn2.unrealengine.com https://*.fn-api.cc",
    ...DEV_API_SOURCES,
  ].join(" "),
  "font-src 'self' data: https://fonts.gstatic.com",
  ["connect-src 'self'", ...API_SOURCES, "https://payment.zarinpal.com https://challenges.cloudflare.com", ...DEV_API_SOURCES].join(" "),
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://payment.zarinpal.com",
  "object-src 'none'",
  isProd ? "upgrade-insecure-requests" : "",
]
  .filter(Boolean)
  .join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'titan-backend-taha.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'fortnite-api.com',
      },
      {
        protocol: 'https',
        hostname: '*.fortnite-api.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.unrealengine.com',
      },
      {
        protocol: 'https',
        hostname: '*.fn-api.cc',
      },
      ...(!isProd
        ? [
            {
              protocol: 'http' as const,
              hostname: 'localhost',
              port: '8000',
            },
            {
              protocol: 'http' as const,
              hostname: '127.0.0.1',
              port: '8000',
            },
          ]
        : []),
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  logging: {
    browserToTerminal: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: `${API_ORIGIN}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
