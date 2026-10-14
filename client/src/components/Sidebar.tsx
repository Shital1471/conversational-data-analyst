import React, { useState } from 'react';
import {
  Users,
  Building2,
  FileCheck2,
  Receipt,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Award,
  Layers,
  ChevronRight,
  Shield,
  Search,
  X,
} from 'lucide-react';
import type { DatabaseOverview } from '../types/index.js';

interface SidebarProps {
  overview: DatabaseOverview | null;
  onSelectPrompt: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  overview,
  onSelectPrompt,
  isOpen,
  onClose,
}) => {
  const [promptSearch, setPromptSearch] = useState('');

  const promptCategories = [
    {
      title: 'Onboarding & Segments',
      icon: TrendingUp,
      color: 'text-blue-500',
      questions: [
        'Show monthly onboarding applications by customer segment',
        'Compare retail and SME onboarding volumes',
        'Show application status distribution',
      ],
    },
    {
      title: 'Branch Risk & Rejections',
      icon: AlertTriangle,
      color: 'text-amber-500',
      questions: [
        'Which branches have the highest rejection rate?',
        'Show the application approval rate by branch',
        'Show application volume by branch',
      ],
    },
    {
      title: 'Customers & Turnover',
      icon: Award,
      color: 'text-emerald-500',
      questions: [
        'Show the top five customers by transaction value',
        'What is the total transaction value this month?',
        'Show transaction value over time',
      ],
    },
  ];

  const filteredCategories = promptCategories
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter((q) =>
        q.toLowerCase().includes(promptSearch.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-wide">
              Banking Core Scope
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Database Overview KPI Section */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Ledgers
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
              4 Relational Tables
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Customers</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {overview?.totalCustomers ?? '65'}
              </div>
              <span className="text-[10px] text-slate-400">Retail, SME, Corp</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Branches</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {overview?.totalBranches ?? '10'}
              </div>
              <span className="text-[10px] text-slate-400">5 US Regions</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Applications</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {overview?.totalApplications ?? '180'}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {overview?.overallApprovalRate ? `${overview.overallApprovalRate}% approved` : '71.7%'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                <Receipt className="w-3.5 h-3.5 text-amber-500" />
                <span>Transactions</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {overview?.totalTransactions ?? '450'}
              </div>
              <span className="text-[10px] text-slate-400">
                {overview?.totalTransactionVolume
                  ? `$${(overview.totalTransactionVolume / 1_000_000).toFixed(1)}M vol`
                  : 'Ledger Records'}
              </span>
            </div>
          </div>
        </div>

        {/* Searchable Prompt Library */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search analytical questions..."
              value={promptSearch}
              onChange={(e) => setPromptSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Analytical Prompts</span>
          </div>

          {filteredCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                  <span>{cat.title}</span>
                </div>
                <div className="space-y-1.5">
                  {cat.questions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => {
                        onSelectPrompt(q);
                        onClose();
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition group flex items-start justify-between gap-2 shadow-xs"
                    >
                      <span className="line-clamp-2 leading-relaxed font-medium">{q}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5 shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Footnote */}
        <div className="p-3.5 m-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Safe Relational Pipeline</span>
          </div>
          <p className="leading-normal">
            Zero unrestricted raw SQL evaluation. Strict parameterized templates.
          </p>
        </div>
      </aside>
    </>
  );
};
