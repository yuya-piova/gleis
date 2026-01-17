'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

type Meeting = {
  id: string;
  name: string;
  date: string;
  state: string;
  summary: string;
  keywords: string[];
  url: string;
};

export default function MeetingPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/meeting')
      .then((res) => res.json())
      .then((data) => {
        setMeetings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="p-8 text-neutral-500 animate-pulse font-bold">
        Loading Meetings...
      </div>
    );

  return (
    <div className="h-full w-full bg-[#171717] text-sm overflow-hidden flex flex-col">
      {/* テーブルエリア（横スクロール対応） */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="min-w-[800px]">
          {' '}
          {/* 横幅が狭くなりすぎないよう固定 */}
          {/* ヘッダー */}
          <div className="sticky top-0 z-10 flex items-center px-6 py-3 text-neutral-500 font-bold border-b border-neutral-800 bg-[#171717]">
            <div className="w-1/4">名前</div>
            <div className="w-32">日付</div>
            <div className="w-32">ステータス</div>
            <div className="flex-1 px-4">要約</div>
            <div className="w-48">キーワード</div>
          </div>
          {/* リスト本体 */}
          {meetings.length === 0 ? (
            <div className="p-20 text-center text-neutral-600">
              議事録が見つかりません
            </div>
          ) : (
            meetings.map((m) => (
              <a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-2.5 border-b border-neutral-800/40 hover:bg-white/[0.03] transition-colors group"
              >
                <div className="w-1/4 font-semibold text-neutral-200 group-hover:text-blue-400 truncate pr-4 transition-colors">
                  {m.name}
                </div>
                <div className="w-32 text-neutral-500 shrink-0 font-mono">
                  {m.date ? format(parseISO(m.date), 'yyyy/MM/dd') : '-'}
                </div>
                <div className="w-32 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      m.state === 'DONE'
                        ? 'bg-green-900/20 border-green-800 text-green-500'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {m.state}
                  </span>
                </div>
                <div className="flex-1 px-4 text-neutral-400 truncate">
                  {m.summary || (
                    <span className="text-neutral-700 italic">No summary</span>
                  )}
                </div>
                <div className="w-48 flex gap-1 overflow-hidden shrink-0">
                  {m.keywords.map((k) => (
                    <span
                      key={k}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-blue-900/20 text-blue-400 border border-blue-800/30 whitespace-nowrap"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
