'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, Trash2, Check, Loader2 } from 'lucide-react';

// プロジェクト全体で使う共通の型定義
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
  onUpdate: (id: string, updatedData: Partial<Task>) => Promise<void>;
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
  const [isDeleting, setIsDeleting] = useState(false);

  // タスクが切り替わったときに内部ステートをリセット
  useEffect(() => {
    setEditName(task.name);
  }, [task]);

  const handleSave = async () => {
    if (!editName.trim() || editName === task.name) {
      if (editName === task.name) onClose();
      return;
    }
    setIsSaving(true);
    await onUpdate(task.id, { name: editName });
    setIsSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    await onDelete(task.id);
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div
        className="bg-[#1A1A1A] border border-white/10 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 space-y-8">
          {/* ヘッダーエリア */}
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  task.theme === 'blue'
                    ? 'bg-blue-600/10 text-blue-500 border-blue-600/20'
                    : task.theme === 'green'
                      ? 'bg-green-600/10 text-green-500 border-green-600/20'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                {task.cat}
              </span>
              <span className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-500 text-[10px] font-black uppercase tracking-widest border border-neutral-700">
                {task.state}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-white transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>

          {/* メイン編集エリア */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] ml-1">
                Task Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none focus:text-blue-400 transition-colors px-1"
                placeholder="タスク名を入力..."
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] ml-1">
                Summary / Details
              </label>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 min-h-[100px]">
                <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {task.summary || '詳細な要約はありません。'}
                </p>
              </div>
            </div>
          </div>

          {/* アクションエリア */}
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex gap-3">
              <a
                href={task.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/5"
              >
                <ExternalLink size={18} />
                <span>Notion</span>
              </a>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                <span>{isSaving ? '保存中...' : '変更を保存'}</span>
              </button>
            </div>

            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 w-full py-2 text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors group"
              >
                {isDeleting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2
                    size={12}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
                <span>Delete Task</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
