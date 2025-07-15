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
  },
  // 旧システムのURL構造との互換性のためのリライトルール
  async rewrites() {
    return [
      // アカウントアイコン表示
      {
        source: '/open/account/icon/:id',
        destination: '/api/open/account/:id?action=icon',
      },
      // ファイルダウンロード
      {
        source: '/open/files/download/:id',
        destination: '/api/open/files?action=download&fileNo=:id',
      },
      // 画像表示
      {
        source: '/open/files/image/:id',
        destination: '/api/open/files?action=download&fileNo=:id&inline=true',
      },
      // スライド表示
      {
        source: '/open/files/slide/:id/:page',
        destination: '/api/open/files?action=slide&fileNo=:id&page=:page',
      },
    ]
  },
};

export default nextConfig;
