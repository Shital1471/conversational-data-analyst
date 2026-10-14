import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Database,
} from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const starterCards = [
    {
      title: 'Segment Onboarding',
      description: 'Monthly onboarding application volumes broken down by Retail, SME, and Corporate.',
      icon: TrendingUp,
      prompt: 'Show monthly onboarding applications by customer segment',
      badge: 'Multi-Series',
      borderGlow: 'hover:border-blue-500/60',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Branch Rejection Rates',
      description: 'Underwriting rejection percentages and decline counts ranked across all 10 branches.',
      icon: AlertTriangle,
      prompt: 'Which branches have the highest rejection rate?',
      badge: 'Risk Analysis',
      borderGlow: 'hover:border-rose-500/60',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      title: 'Top High-Value Clients',
      description: 'Identify the top five clients by cumulative transaction amount and transaction counts.',
      icon: Award,
      prompt: 'Show the top five customers by transaction value',
      badge: 'Wealth & Accounts',
      borderGlow: 'hover:border-emerald-500/60',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Retail vs SME Comparison',
      description: 'Compare retail and commercial SME onboarding pipelines, volumes, and approval rates.',
      icon: CreditCard,
      prompt: 'Compare retail and SME onboarding volumes',
      badge: 'Benchmarking',
      borderGlow: 'hover:border-indigo-500/60',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 text-center animate-slide-up">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 font-semibold mb-4">
        <Database className="w-3.5 h-3.5" />
        <span>Verified Relational Banking Datasets Live</span>
      </div>

      {/* Main Title & Description */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
        Institutional Banking Analytics Assistant
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
        Ask natural language questions about customer acquisition, underwriting rejection rates, branch risk, and financial turnover. All responses are calculated in real time from relational SQLite ledgers.
      </p>

      {/* Starter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left mb-8">
        {starterCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(card.prompt)}
              className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${card.borderGlow} transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md text-left group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {card.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {card.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                <span className="truncate pr-2">"{card.prompt}"</span>
                <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Security Banner */}
      <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-full shadow-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Enterprise Security: Deterministic matching & strictly parameterized SQL queries only</span>
      </div>
    </div>
  );
};
