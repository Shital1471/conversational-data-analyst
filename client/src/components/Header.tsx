import React from 'react';
import { Database, ShieldCheck, RefreshCw, BarChart3, Menu } from 'lucide-react';

interface HeaderProps {
  dbConnected: boolean;
  onReset: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dbConnected,
  onReset,
  onToggleSidebar,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden focus:outline-none"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Conversational Data Analyst
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Banking Core
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Safe relational analytics over verified banking ledgers
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* DB Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
          <span className="relative flex h-2 w-2">
            {dbConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                dbConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-300 font-medium hidden md:inline">
            {dbConnected ? 'SQLite Live (WAL)' : 'Database Offline'}
          </span>
        </div>

        {/* Security Verified badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Parameterized SQL</span>
        </div>

        {/* Clear Conversation */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
          title="Reset Conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
};
