'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Settings as SettingsIcon } from 'lucide-react';
import TaskModal, { Task } from '@/components/TaskModal';
import SettingsModal from '@/components/SettingsModal'; // 設定モーダルをインポート
import { useTasks } from '@/hooks/useTasks';

export default function Dashboard() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // カスタムフックでロジックを共通化
  const { tasks, setTasks, updateTask, deleteTask } = useTasks([], () =>
    fetchTasks(),
  );

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // サイドバーからの設定オープンイベントをリッスン
    const handleOpenSettings = () => setShowSettings(true);
    window.addEventListener('open-settings', handleOpenSettings);
    return () =>
      window.removeEventListener('open-settings', handleOpenSettings);
  }, []);

  // 週カレンダー生成
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

  // クイック追加（以前のロジック）
  const handleQuickAdd = async (date: string | null) => {
    const name = window.prompt('新しいタスク名を入力してください');
    if (!name) return;
    const res = await fetch('/api/tasks/create', {
      method: 'POST',
      body: JSON.stringify({ name, date }),
    });
    if (res.ok) fetchTasks();
  };

  return (
    <div className="h-full flex flex-col bg-[#171717] overflow-hidden">
      <main className="flex-1 overflow-x-auto no-scrollbar flex p-6 gap-6">
        {/* Inbox カラム */}
        <section className="w-72 shrink-0 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
              Inbox
            </h2>
            <button
              onClick={() => handleQuickAdd(null)}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-10">
            {tasks
              .filter((t) => !t.date)
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
          </div>
        </section>

        {/* 曜日カラム */}
        {weekDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter((t) => t.date === dateStr);
          const active = isToday(day);

          return (
            <section
              key={dateStr}
              className="w-72 shrink-0 flex flex-col gap-4"
            >
              <div
                className={`px-2 py-1 rounded-xl transition-colors ${active ? 'bg-blue-600/5' : ''}`}
              >
                <div
                  className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-blue-500' : 'text-neutral-600'}`}
                >
                  {format(day, 'EEE', { locale: ja })}
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-black ${active ? 'text-white' : 'text-neutral-300'}`}
                  >
                    {format(day, 'dd')}
                  </span>
                  {active && (
                    <span className="text-[10px] font-bold text-blue-500 italic">
                      TODAY
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-10">
                {dayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
                <button
                  onClick={() => handleQuickAdd(dateStr)}
                  className="w-full py-3 border-2 border-dashed border-neutral-800/50 rounded-2xl text-neutral-700 hover:border-neutral-700 hover:text-neutral-500 transition-all flex items-center justify-center gap-2 group"
                >
                  <Plus
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Add Task
                  </span>
                </button>
              </div>
            </section>
          );
        })}
      </main>

      {/* 詳細モーダル */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}

      {/* 設定モーダル */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

// デザイン復元版 TaskCard
function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative p-5 bg-neutral-900/60 border border-white/5 rounded-[24px] cursor-pointer hover:border-blue-500/30 hover:bg-neutral-800/40 transition-all duration-300 shadow-xl"
    >
      {/* 左端アクセントライン */}
      <div
        className={`absolute left-0 top-5 bottom-5 w-1 rounded-r-full transition-all group-hover:w-1.5 ${
          task.theme === 'blue'
            ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
            : task.theme === 'green'
              ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
              : 'bg-neutral-700'
        }`}
      />

      <div className="pl-3">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-blue-400 transition-colors">
            {task.cat}
          </span>
          {task.state === 'Doing' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          )}
        </div>

        <h3 className="font-bold text-[14px] text-neutral-200 leading-tight group-hover:text-white transition-colors line-clamp-2">
          {task.name}
        </h3>

        {task.summary && (
          <p className="mt-2 text-[10px] text-neutral-600 line-clamp-1 italic group-hover:text-neutral-500 transition-colors">
            {task.summary}
          </p>
        )}
      </div>
    </div>
  );
}
