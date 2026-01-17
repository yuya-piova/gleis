'use client';

import { useState, useEffect } from 'react';
import {
  format,
  getWeek,
  differenceInDays,
  startOfYear,
  endOfYear,
} from 'date-fns';

type Task = {
  id: string;
  name: string;
  cat: string;
  summary: string;
  state: string;
};

export default function FocusPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 今日の日付・進捗データ計算 ---
  const today = new Date();
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const totalDays = differenceInDays(yearEnd, yearStart) + 1;
  const passedDays = differenceInDays(today, yearStart) + 1;
  const yearProgress = ((passedDays / totalDays) * 100).toFixed(1);
  const weekNumber = getWeek(today, { weekStartsOn: 1 });

  useEffect(() => {
    // APIから今日のタスクのみ取得（フィルタ条件: Date = today）
    const todayStr = format(today, 'yyyy-MM-dd');
    fetch(`/api/tasks?date=${todayStr}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="h-full bg-[#171717] flex flex-col md:flex-row overflow-hidden no-scrollbar">
      {/* 左側：今日という日のデータ (モチベーター) */}
      <div className="w-full md:w-80 p-8 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col gap-8 shrink-0">
        <section>
          <h2 className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-2">
            Today
          </h2>
          <div className="text-4xl font-black">{format(today, 'MM.dd')}</div>
          <div className="text-neutral-400 font-medium">
            {format(today, 'EEEE')}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-neutral-500">YEAR PROGRESS</span>
              <span className="text-blue-500">{yearProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-1000"
                style={{ width: `${yearProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 p-3 rounded-xl border border-neutral-800">
              <div className="text-neutral-500 text-[10px] font-bold">WEEK</div>
              <div className="text-xl font-bold font-mono">#{weekNumber}</div>
            </div>
            <div className="bg-neutral-900/50 p-3 rounded-xl border border-neutral-800">
              <div className="text-neutral-500 text-[10px] font-bold">DAY</div>
              <div className="text-xl font-bold font-mono">{passedDays}</div>
            </div>
          </div>
        </section>
      </div>

      {/* 右側：今日のタスク詳細リスト */}
      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <h2 className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-6">
          Today's Focus
        </h2>

        {loading ? (
          <div className="text-neutral-600">Loading focus...</div>
        ) : tasks.length === 0 ? (
          <div className="text-neutral-700 py-10 italic">
            No tasks for today.
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group relative flex flex-col gap-2 p-4 bg-neutral-900/30 rounded-2xl border border-neutral-800/50 hover:border-blue-900/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">
                      {task.cat}
                    </span>
                    <h3 className="font-bold text-lg text-neutral-200">
                      {task.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tighter">
                    {task.state}
                  </span>
                </div>
                {/* Dashboardより詳細に：要約を表示 */}
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {task.summary || 'No description provided.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
