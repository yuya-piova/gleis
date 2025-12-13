import './globals.css';
import type { Metadata } from 'next';

// PWAマニフェストとviewport設定を定義
export const metadata: Metadata = {
  title: 'Woche Task Dashboard',
  description: 'Notion Task Dashboard for Work and Life',
  // ★ PWA設定: ここから
  manifest: '/manifest.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    // PWAの全画面表示に対応
    //interactiveWidget: 'resizes-visual',
  },
  // ★ PWA設定: ここまで
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // lang="ja" で日本語設定
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
