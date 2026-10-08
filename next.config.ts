import type { NextConfig } from "next";

// Same default as src/lib/api/client.ts. /media is proxied to wherever the API runs; deployed
// backends return absolute media URLs (Vercel Blob), so this only matters for relative ones.
const API_ORIGIN = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").origin;

const nextConfig: NextConfig = {
  logging: {
    browserToTerminal: true,
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
