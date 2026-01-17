'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Video,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  openSettings: () => void;
}

export default function Sidebar({
  isOpenMobile,
  setIsOpenMobile,
  openSettings,
}: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Focus', icon: <Target size={20} />, path: '/focus' },
    { name: 'Weekly', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Meeting', icon: <Video size={20} />, path: '/meeting' },
  ];

  return (
    <>
      {/* モバイル用オーバーレイ */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* サイドバー本体 */}
      <aside
        className={`
        fixed md:relative z-[70] h-full bg-[#1A1A1A] border-r border-neutral-800
        flex flex-col items-center py-6 transition-all duration-300
        ${isOpenMobile ? 'left-0 w-20' : '-left-20 md:left-0 md:w-16'}
      `}
      >
        {/* アプリロゴ (GleisのGを象徴的に) */}
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-10 shadow-lg shadow-blue-900/20">
          <span className="text-white font-black text-xl">G</span>
        </div>

        {/* メニューアイテム */}
        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsOpenMobile(false)}
                className={`
                  relative group flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                      : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
                  }
                `}
              >
                {item.icon}
                {/* ツールチップ */}
                <div className="absolute left-14 px-3 py-1 bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* 下部：設定ボタン */}
        <button
          onClick={openSettings}
          className="w-12 h-12 flex items-center justify-center text-neutral-600 hover:text-white hover:bg-neutral-800 rounded-2xl transition-all group relative"
        >
          <SettingsIcon size={20} />
          <div className="absolute left-14 px-3 py-1 bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            Settings
          </div>
        </button>
      </aside>
    </>
  );
}
