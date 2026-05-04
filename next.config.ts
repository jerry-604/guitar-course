import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      // Cloudflare R2 via our custom domain (course covers + assets)
      { protocol: "https", hostname: "videos.thanielguitarlessons.com" },
    ],
  },
};

export default nextConfig;
