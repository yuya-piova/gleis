'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, Trash2, CheckCircle } from 'lucide-react';

// APIや各ページで使う共通の型定義
export type Task = {
  id: string;
  name: string;
  date: string | null;
  state: string;
  cat: string;
  subCats: string[];
  theme: string;
  summary: string;
  url: string;
};

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedData: Partial<Task>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function TaskModal({
  task,
  onClose,
  onUpdate,
  onDelete,
}: TaskModalProps) {
  const [editName, setEditName] = useState(task.name);
  const [isSaving, setIsSaving] = useState(false);

  // タスクが切り替わった時に名前をリセット
  useEffect(() => {
    setEditName(task.name);
  }, [task]);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate({ name: editName });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-[#1C1C1C] border border-white/5 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 space-y-8">
          {/* ヘッダー */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
                {task.cat}
              </span>
              <span className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-black uppercase tracking-widest border border-neutral-700">
                {task.state}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* 名前入力 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em]">
              Task Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none focus:text-blue-400 transition-colors"
              placeholder="Task name..."
            />
          </div>

          {/* 要約表示 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em]">
              Summary
            </label>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 min-h-[80px]">
              <p className="text-neutral-400 text-sm leading-relaxed">
                {task.summary || 'No summary available.'}
              </p>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex gap-3">
              <a
                href={task.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/5"
              >
                <ExternalLink size={18} />
                <span>Notion</span>
              </a>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <CheckCircle size={18} />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="w-full py-3 text-red-500/50 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Delete Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
