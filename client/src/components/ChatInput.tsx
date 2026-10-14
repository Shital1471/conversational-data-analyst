import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

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
    <div className="border-t border-slate-800 bg-slate-900/90 backdrop-blur p-4 sm:p-5 sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick Suggestion Chips above input */}
        {quickPrompts && quickPrompts.length > 0 && !isLoading && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap mr-1">
              Suggestions:
            </span>
            {quickPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition text-[11px] shrink-0"
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
                ? 'Processing analytical query...'
                : 'Ask a banking analytics question (e.g., "Which branches have the highest rejection rate?")...'
            }
            maxLength={500}
            className={`w-full bg-slate-950 border ${
              isTooLong ? 'border-rose-500' : 'border-slate-700/80'
            } focus:border-blue-500 rounded-xl pl-4 pr-24 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition shadow-inner disabled:opacity-60`}
          />

          <div className="absolute right-2.5 flex items-center gap-2">
            <span
              className={`text-[10px] hidden sm:inline ${
                input.length > 450
                  ? 'text-rose-400 font-semibold'
                  : 'text-slate-500'
              }`}
            >
              {input.length}/500
            </span>

            <button
              type="submit"
              disabled={!input.trim() || isLoading || isTooLong}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-800 disabled:text-slate-600 transition shadow-sm active:scale-95 flex items-center justify-center"
              title="Submit Query"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Enterprise banking intelligence assistant • SQLite core</span>
          <span className="hidden sm:inline">Press Enter ↵ to submit</span>
        </div>
      </div>
    </div>
  );
};
