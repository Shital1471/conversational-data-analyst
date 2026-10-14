import React from 'react';
import { Sparkles } from 'lucide-react';

interface PromptChipsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  title?: string;
}

export const PromptChips: React.FC<PromptChipsProps> = ({
  prompts,
  onSelect,
  title,
}) => {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="my-3 space-y-2">
      {title && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>{title}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(p)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500/50 transition shadow-xs text-left active:scale-[0.98] font-medium"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
