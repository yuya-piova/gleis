/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  publicExcludes: [
    '!manifest.webmanifest',
    '!icons/icon-*.png',
    '!robots.txt',
    '!sitemap.xml',
  ],
  // ★ 重要: next-pwaの内部で使われるwebpack設定を空で上書きし、Turbopackのチェックを回避する
  webpack: (config, { isServer }) => {
    return config;
  },
});

const nextConfig = {
  // ★ 重要: ビルドワーカーのエラーを避けるため、Next.jsのビルド設定を調整
  experimental: {
    // Vercel環境でのファイル監視プロセスを安定化
    optimizeServerExternalPackages: true,
  },

  // ★ PWAが動作するため、TurbopackではなくWebpackを使用することを推奨
  // ただし、この設定は環境に依存するため、Turbopack設定自体は空にしておく
  turbopack: {},
};

// withPWAで設定をラップし、PWA機能を組み込む
module.exports = withPWA(nextConfig);
