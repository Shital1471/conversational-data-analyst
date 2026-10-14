import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { KPI } from '../types/index.js';

interface KpiCardsProps {
  kpis: KPI[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  if (!kpis || kpis.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
      {kpis.map((kpi, idx) => {
        return (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
              <span>{kpi.label}</span>
              {kpi.trend === 'up' && (
                <span className="flex items-center text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" /> High
                </span>
              )}
              {kpi.trend === 'down' && (
                <span className="flex items-center text-rose-400 font-semibold text-[11px] bg-rose-500/10 px-1.5 py-0.5 rounded">
                  <ArrowDownRight className="w-3 h-3 mr-0.5" /> Low
                </span>
              )}
              {kpi.trend === 'neutral' && (
                <span className="flex items-center text-slate-400 text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                  <Minus className="w-3 h-3 mr-0.5" /> Mid
                </span>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight my-0.5">
              {kpi.value}
            </div>

            {kpi.subtext && (
              <div className="text-[11px] text-slate-400 truncate">
                {kpi.subtext}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
