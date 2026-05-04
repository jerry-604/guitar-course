import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "pub-3410e1e40f1a47128a7371ab17d56ad3.r2.dev" },
    ],
  },
};

export default nextConfig;
