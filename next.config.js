/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public', // サービスワーカーの出力先
  disable: process.env.NODE_ENV === 'development', // 開発環境では無効にする
  // PWAに必要なファイルをVercelでホストできるように設定
  publicExcludes: [
    '!manifest.webmanifest',
    '!icons/icon-*.png',
    '!robots.txt',
    '!sitemap.xml',
  ],
});
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
