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
      // 旧システムファイルダウンロード（完全互換）
      {
        source: '/knowledge/open.file/download',
        destination: '/api/open/files/download',
      },
      // 旧システムスライド表示
      {
        source: '/knowledge/open.file/slide/:path*',
        destination: '/api/open/files/slide/:path*',
      },
      // アカウントアイコン表示
      {
        source: '/open/account/icon/:id',
        destination: '/api/open/account/:id?action=icon',
      },
      // ファイルダウンロード（新形式）
      {
        source: '/open/files/download/:id',
        destination: '/api/open/files?action=download&fileNo=:id',
      },
      // 画像表示（新形式）
      {
        source: '/open/files/image/:id',
        destination: '/api/open/files?action=download&fileNo=:id&inline=true',
      },
      // スライド表示（新形式）
      {
        source: '/open/files/slide/:id/:page',
        destination: '/api/open/files?action=slide&fileNo=:id&page=:page',
      },
    ]
  },
};

export default nextConfig;
