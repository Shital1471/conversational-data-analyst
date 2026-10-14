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
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>{title}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(p)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 hover:border-blue-500/50 transition shadow-sm text-left active:scale-[0.98]"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
