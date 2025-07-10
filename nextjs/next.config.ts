import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  images: {
    domains: ['localhost'],
  },
  // Enable hot reloading for better development experience
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  }
};

export default nextConfig;
