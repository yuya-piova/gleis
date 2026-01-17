import { useState } from 'react';
import { Task } from '@/components/TaskModal';

export function useTasks(initialTasks: Task[], onRefresh?: () => void) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // 1. タスク更新
  const updateTask = async (id: string, updatedData: Partial<Task>) => {
    try {
      const res = await fetch('/api/tasks/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedData }),
      });

      if (res.ok) {
        // ローカルの状態を即時更新（楽観的更新）
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t)),
        );
        if (onRefresh) onRefresh(); // 必要なら再取得
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // 2. タスク削除
  const deleteTask = async (id: string) => {
    if (!confirm('このタスクを削除しますか？')) return;
    try {
      const res = await fetch(`/api/tasks/delete?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return { tasks, setTasks, updateTask, deleteTask };
}
