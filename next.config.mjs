/** @type {import('next').NextConfig} */

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