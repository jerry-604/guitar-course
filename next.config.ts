import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      // Vercel Blob host for course cover images (and any future assets)
      {
        protocol: "https",
        hostname: "mfewqehaa0bzdb25.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
