'use client';
import { useState, useEffect } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  isBefore,
  isAfter,
  startOfDay,
} from 'date-fns';
import { ja } from 'date-fns/locale';

// タスクの型定義
type Task = {
  id: string;
  title: string;
  date: string | null;
  state: string;
  cat: string;
  subCats: string[];
  theme: string;
  url: string;
};

export default function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  // 今日の日付と、今週の月曜日を取得
  const today = new Date();
  // weekStartsOn: 1 は月曜始まり
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });

  // 1週間分の日付配列を作成 (月〜日)
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfCurrentWeek, i)
  );

  // データ取得
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // 時計更新
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }, 1000);

    // 1分ごとにタスク再取得（自動更新）
    const poller = setInterval(fetchTasks, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(poller);
    };
  }, []);

  // ■ タスクの完了処理（擬似的）
  // 本来はAPIを叩いてNotion側を更新するが、まずはUIから消す処理のみ
  const handleComplete = (id: string) => {
    // ここで PATCH /api/tasks { id, status: 'Done' } を呼ぶ処理が入る
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // ■ タスクの振り分けロジック
  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => {
      if (!task.date) return false;
      return isSameDay(parseISO(task.date), day);
    });
  };

  const getInboxTasks = () => {
    return tasks.filter((task) => {
      // 日付未設定
      if (!task.date) return true;
      // または、今週の月曜より前（Overdue）
      // かつ、まだ完了していないもの
      return isBefore(parseISO(task.date), startOfCurrentWeek);
    });
  };

  // --- UIコンポーネント (カード) ---
  const TaskCard = ({ task }: { task: Task }) => {
    // テーマカラーに応じたスタイル
    const colors: any = {
      blue: {
        bg: 'border-blue-500',
        badge: 'text-blue-200 bg-blue-900/50 border-blue-800',
      }, // Work
      green: {
        bg: 'border-green-500',
        badge: 'text-green-200 bg-green-900/50 border-green-800',
      }, // Life
      gray: {
        bg: 'border-neutral-500',
        badge: 'text-neutral-300 bg-neutral-800 border-neutral-700',
      },
    };
    const style = colors[task.theme] || colors.gray;

    return (
      <div
        className={`bg-neutral-800 p-4 rounded-lg border-l-4 ${style.bg} shadow-sm hover:bg-neutral-700 transition relative group`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-1 flex-wrap">
            {/* Cat Badge */}
            <span
              className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${style.badge}`}
            >
              {task.cat || 'No Cat'}
            </span>
            {/* SubCat Badges (小さく表示) */}
            {task.subCats.map((sub) => (
              <span
                key={sub}
                className="px-1.5 py-0.5 text-[10px] text-neutral-400 bg-neutral-900 rounded border border-neutral-800"
              >
                {sub}
              </span>
            ))}
          </div>
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-white p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </a>
        </div>

        <div className="font-bold mb-1 text-lg leading-tight">{task.title}</div>

        {/* State表示 */}
        <div className="text-xs text-neutral-500 mb-3 font-mono">
          Status: {task.state}
        </div>

        <button
          onClick={() => handleComplete(task.id)}
          className="text-xs w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition font-bold border border-neutral-800"
        >
          完了 (Done)
        </button>
      </div>
    );
  };

  if (loading)
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        Loading Notion...
      </div>
    );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#171717] text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="flex-none p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/95 z-20">
        <div>
          <h1 className="text-neutral-500 text-xs font-bold uppercase tracking-wider">
            My Tasks
          </h1>
          <div className="text-xl font-bold flex items-center gap-2">
            <span>Dashboard</span>
            <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded">
              {format(startOfCurrentWeek, 'MMM d')} -{' '}
              {format(addDays(startOfCurrentWeek, 6), 'MMM d')}
            </span>
          </div>
        </div>
        <div className="text-3xl font-black tracking-tighter leading-none">
          {currentTime}
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden bg-black">
        <div className="flex flex-col md:flex-row h-auto md:h-full min-w-full divide-y md:divide-y-0 md:divide-x divide-neutral-800">
          {/* 1. Inbox / Overdue Column */}
          <div className="flex-none w-full md:w-80 bg-neutral-900/50 flex flex-col h-auto md:h-full">
            <div className="p-3 border-b border-red-900/30 bg-red-900/10 sticky top-0 md:static">
              <h3 className="font-bold text-red-400 flex justify-between items-center">
                Inbox / Overdue
                <span className="text-xs bg-red-900 text-red-200 px-2 py-0.5 rounded-full">
                  {getInboxTasks().length}
                </span>
              </h3>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 h-full min-h-[150px]">
              {getInboxTasks().map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* 2-8. Week Days Columns */}
          {weekDays.map((day) => {
            const isToday = isSameDay(day, today);
            const dayTasks = getTasksForDay(day);

            return (
              <div
                key={day.toISOString()}
                className={`flex-none w-full md:w-72 flex flex-col h-auto md:h-full relative ${
                  isToday ? 'bg-blue-900/10' : ''
                }`}
              >
                <div
                  className={`p-3 border-b border-neutral-800 ${
                    isToday
                      ? 'bg-blue-900/20 border-blue-500/30'
                      : 'bg-neutral-900'
                  } sticky top-0 md:static`}
                >
                  <h3
                    className={`font-bold ${
                      isToday ? 'text-blue-300' : 'text-neutral-300'
                    }`}
                  >
                    {format(day, 'EEE', { locale: ja })}{' '}
                    <span className="text-sm opacity-60 ml-1">
                      {format(day, 'M/d')}
                    </span>
                    {isToday && (
                      <span className="ml-2 text-[10px] bg-blue-500 text-white px-1.5 rounded uppercase">
                        Today
                      </span>
                    )}
                  </h3>
                </div>
                <div className="p-3 space-y-3 overflow-y-auto flex-1 h-full min-h-[150px]">
                  {dayTasks.length === 0 ? (
                    <div className="text-center text-neutral-700 text-sm py-8">
                      No Tasks
                    </div>
                  ) : (
                    dayTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
