/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  // PWAの設定を適用
  ...withPWA({
    reactStrictMode: true,
  }),

  // Dockerでの利用やVercelでの互換性向上のためのオプション
  compiler: {
    // Turbopackやその他の環境で警告が出ないように設定
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

// 最終的なエクスポート
module.exports = nextConfig;
