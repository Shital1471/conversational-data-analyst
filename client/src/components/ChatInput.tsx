import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  quickPrompts?: string[];
  onSelectPrompt: (prompt: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  quickPrompts,
  onSelectPrompt,
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    onSend(trimmed);
    setInput('');
  };

  const isTooLong = input.length > 500;

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 sm:p-5 sticky bottom-0 z-20 transition-colors">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick Suggestion Chips above input */}
        {quickPrompts && quickPrompts.length > 0 && !isLoading && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Quick:
            </span>
            {quickPrompts.slice(0, 4).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt(prompt)}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition text-[11px] shrink-0 font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={
              isLoading
                ? 'Synthesizing verified banking analytics...'
                : 'Ask a banking analytics question (e.g., "Which branches have the highest rejection rate?")...'
            }
            maxLength={500}
            className={`w-full bg-slate-50 dark:bg-slate-950 border ${
              isTooLong
                ? 'border-rose-500'
                : 'border-slate-300 dark:border-slate-700/80 focus:border-blue-500'
            } rounded-2xl pl-4 pr-24 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition shadow-inner disabled:opacity-60 font-medium`}
          />

          <div className="absolute right-2.5 flex items-center gap-2">
            <span
              className={`text-[10px] hidden sm:inline ${
                input.length > 450
                  ? 'text-rose-500 font-bold'
                  : 'text-slate-400 dark:text-slate-500 font-medium'
              }`}
            >
              {input.length}/500
            </span>

            <button
              type="submit"
              disabled={!input.trim() || isLoading || isTooLong}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 transition shadow-sm active:scale-95 flex items-center justify-center shrink-0"
              title="Submit Query"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1 font-medium">
          <span>Enterprise banking intelligence assistant • SQLite core</span>
          <span className="hidden sm:inline">Press Enter ↵ to submit</span>
        </div>
      </div>
    </div>
  );
};
