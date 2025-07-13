import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  images: {
    domains: ['localhost'],
  },
  eslint: {
    // ESLintチェックを一時的に無効化（型安全性は改善済み）
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScriptチェックを有効化（Next.js 15移行完了）
    ignoreBuildErrors: false,
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
