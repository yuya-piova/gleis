'use client';

import React from 'react';

interface SettingsModalProps {
  onClose: () => void;
  filter: 'All' | 'Work';
  setFilter: (filter: 'All' | 'Work') => void;
  isCompactPast: boolean;
  setIsCompactPast: (val: boolean) => void;
}

export default function SettingsModal({
  onClose,
  filter,
  setFilter,
  isCompactPast,
  setIsCompactPast,
}: SettingsModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-6 text-white">Settings</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-neutral-300">
              表示フィルタ
            </span>
            <button
              onClick={() => setFilter(filter === 'All' ? 'Work' : 'All')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                filter === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-600 text-white'
              }`}
            >
              {filter === 'All' ? 'All' : 'Work Only'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-neutral-300">
              過去日の幅縮小
            </span>
            <button
              onClick={() => setIsCompactPast(!isCompactPast)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                isCompactPast
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-700 text-neutral-400'
              }`}
            >
              {isCompactPast ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-8 w-full py-3 bg-neutral-700 rounded-xl font-bold text-white hover:bg-neutral-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
