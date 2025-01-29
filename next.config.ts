import type { NextConfig } from "next";

const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: "http",
          hostname: "res.cloudinary.com",
        },
      ],
    },
  };
export default nextConfig;
