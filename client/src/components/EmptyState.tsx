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
      color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
    },
    {
      title: 'Branch Rejection Rates',
      description: 'Underwriting rejection percentages and decline counts ranked across all 10 branches.',
      icon: AlertTriangle,
      prompt: 'Which branches have the highest rejection rate?',
      badge: 'Risk Analysis',
      color: 'from-rose-500/10 to-rose-600/5 border-rose-500/20 text-rose-400',
    },
    {
      title: 'Top High-Value Clients',
      description: 'Identify the top five clients by cumulative transaction amount and transaction counts.',
      icon: Award,
      prompt: 'Show the top five customers by transaction value',
      badge: 'Wealth & Accounts',
      color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    },
    {
      title: 'Retail vs SME Comparison',
      description: 'Compare retail and commercial SME onboarding pipelines, volumes, and approval rates.',
      icon: CreditCard,
      prompt: 'Compare retail and SME onboarding volumes',
      badge: 'Benchmarking',
      color: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 text-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium mb-4">
        <Database className="w-3.5 h-3.5" />
        <span>Primary Relational Banking Datasets Ready</span>
      </div>

      {/* Main Title & Description */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mb-3">
        Banking Analytics Assistant
      </h2>
      <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
        Ask natural language questions about customer acquisition, underwriting rejection rates, branch performances, and monetary transaction turnovers. All results are verified from the SQLite database.
      </p>

      {/* Starter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left mb-8">
        {starterCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(card.prompt)}
              className={`p-4 rounded-xl bg-gradient-to-br ${card.color} border hover:border-slate-600 transition-all duration-150 hover:-translate-y-0.5 shadow-sm text-left group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {card.badge}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-200 text-sm mb-1 group-hover:text-white transition">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {card.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-medium text-slate-300 pt-2 border-t border-slate-800/60 group-hover:text-blue-400 transition">
                <span className="truncate pr-2">"{card.prompt}"</span>
                <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Security Banner */}
      <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Enterprise Security: Deterministic matching & parameterized queries only</span>
      </div>
    </div>
  );
};
