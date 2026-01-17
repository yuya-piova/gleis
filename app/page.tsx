'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import TaskModal, { Task } from '@/components/TaskModal';
import { useTasks } from '@/hooks/useTasks';

export default function Dashboard() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // カスタムフックを使用
  const { tasks, setTasks, updateTask, deleteTask } = useTasks([]);

  // 初期データの取得
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [setTasks]);

  // 週カレンダーの生成
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

  return (
    <div className="h-full flex flex-col bg-[#171717]">
      <main className="flex-1 overflow-x-auto no-scrollbar flex p-4 gap-4">
        {/* Inbox カラム */}
        <section className="w-72 shrink-0 flex flex-col">
          <h2 className="p-2 text-xs font-black text-neutral-500 uppercase tracking-widest">
            Inbox
          </h2>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
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
          return (
            <section key={dateStr} className="w-72 shrink-0 flex flex-col">
              <div className="p-2 mb-2">
                <div className="text-[10px] font-black text-neutral-600 uppercase">
                  {format(day, 'EEE', { locale: ja })}
                </div>
                <div className="text-xl font-black">{format(day, 'dd')}</div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                {dayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* 共通モーダル */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(data) => updateTask(selectedTask.id, data)}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}

// サブコンポーネント：タスクカード
function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group p-4 bg-neutral-900/50 border border-white/5 rounded-2xl cursor-pointer hover:border-blue-500/30 transition-all"
    >
      <div
        className={`w-8 h-1 rounded-full mb-3 ${
          task.theme === 'blue'
            ? 'bg-blue-500'
            : task.theme === 'green'
              ? 'bg-green-500'
              : 'bg-neutral-700'
        }`}
      />
      <h3 className="font-bold text-sm text-neutral-200 group-hover:text-blue-400 transition-colors line-clamp-2">
        {task.name}
      </h3>
    </div>
  );
}
