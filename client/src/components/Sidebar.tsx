import React from 'react';
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
  X
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
  const promptCategories = [
    {
      title: 'Onboarding & Segments',
      icon: TrendingUp,
      color: 'text-blue-400',
      questions: [
        'Show monthly onboarding applications by customer segment',
        'Compare retail and SME onboarding volumes',
        'Show application status distribution',
      ],
    },
    {
      title: 'Branch Risk & Rejections',
      icon: AlertTriangle,
      color: 'text-amber-400',
      questions: [
        'Which branches have the highest rejection rate?',
        'Show the application approval rate by branch',
        'Show application volume by branch',
      ],
    },
    {
      title: 'Customers & Turnover',
      icon: Award,
      color: 'text-emerald-400',
      questions: [
        'Show the top five customers by transaction value',
        'What is the total transaction value this month?',
        'Show transaction value over time',
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-80 bg-slate-900 border-r border-slate-800 z-40 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold text-slate-200 text-sm tracking-wide">
              Banking Core Analytics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Database Overview KPI Section */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Live Database Scope
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              4 Tables
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Customers</span>
              </div>
              <div className="text-base font-bold text-slate-100">
                {overview?.totalCustomers ?? '—'}
              </div>
              <span className="text-[10px] text-slate-400">Retail, SME, Corp</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Branches</span>
              </div>
              <div className="text-base font-bold text-slate-100">
                {overview?.totalBranches ?? '10'}
              </div>
              <span className="text-[10px] text-slate-400">5 Regions</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Applications</span>
              </div>
              <div className="text-base font-bold text-slate-100">
                {overview?.totalApplications ?? '—'}
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">
                {overview?.overallApprovalRate ? `${overview.overallApprovalRate}% approved` : '—'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                <span>Transactions</span>
              </div>
              <div className="text-base font-bold text-slate-100">
                {overview?.totalTransactions ?? '—'}
              </div>
              <span className="text-[10px] text-slate-400">
                {overview?.totalTransactionVolume
                  ? `$${(overview.totalTransactionVolume / 1_000_000).toFixed(1)}M vol`
                  : 'Ledger records'}
              </span>
            </div>
          </div>
        </div>

        {/* Prompt Library */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Analytical Questions</span>
          </div>

          {promptCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
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
                      className="w-full text-left p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition group flex items-start justify-between gap-2"
                    >
                      <span className="line-clamp-2 leading-relaxed">{q}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5 shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Architecture & Security Footnote */}
        <div className="p-3.5 m-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Safe Relational Pipeline</span>
          </div>
          <p className="leading-normal text-slate-400">
            Strict intent-bound SQL templates. Zero unrestricted raw query execution.
          </p>
        </div>
      </aside>
    </>
  );
};
