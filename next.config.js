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

    // ★重要: Turbopackのエラーを回避するため、webpack設定を空の関数として渡す
    // next-pwaの内部で使われるwebpack設定を上書きし、Turbopackのチェックを回避する
    webpack: (config, options) => {
      return config;
    },
  }),
};

module.exports = nextConfig;
