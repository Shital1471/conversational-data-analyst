import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from 'lucide-react';
import type { KPI } from '../types/index.js';

interface KpiCardsProps {
  kpis: KPI[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  if (!kpis || kpis.length === 0) return null;

  // Generates a decorative SVG sparkline path
  const renderSparkline = (trend?: 'up' | 'down' | 'neutral', idx: number = 0) => {
    let d = 'M 0,20 Q 25,5 50,15 T 100,5';
    let strokeColor = '#3b82f6';

    if (trend === 'up') {
      d = 'M 0,25 Q 30,20 60,10 T 100,2';
      strokeColor = '#10b981';
    } else if (trend === 'down') {
      d = 'M 0,5 Q 30,10 60,18 T 100,28';
      strokeColor = '#ef4444';
    } else {
      if (idx % 2 === 0) {
        d = 'M 0,15 Q 30,22 60,8 T 100,12';
      } else {
        d = 'M 0,20 Q 25,8 55,22 T 100,10';
      }
    }

    return (
      <svg className="w-16 h-7 overflow-visible opacity-75" viewBox="0 0 100 30" fill="none">
        <path
          d={d}
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Checks if the value is a percentage to render a mini progress bar
  const extractPercentage = (val: string | number): number | null => {
    if (typeof val === 'number') {
      return val <= 100 ? val : null;
    }
    const match = String(val).match(/([\d.]+)%/);
    if (match) {
      const num = parseFloat(match[1]);
      return isNaN(num) ? null : Math.min(Math.max(num, 0), 100);
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
      {kpis.map((kpi, idx) => {
        const pct = extractPercentage(kpi.value);

        return (
          <div
            key={idx}
            className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md dark:shadow-none hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
          >
            {/* Top decorative gradient bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                kpi.trend === 'up'
                  ? 'from-emerald-500 to-teal-400'
                  : kpi.trend === 'down'
                  ? 'from-rose-500 to-amber-500'
                  : 'from-blue-500 to-indigo-500'
              }`}
            />

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">
              <span className="truncate pr-1">{kpi.label}</span>
              {kpi.trend === 'up' && (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" /> High
                </span>
              )}
              {kpi.trend === 'down' && (
                <span className="flex items-center text-rose-600 dark:text-rose-400 font-semibold text-[11px] bg-rose-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                  <ArrowDownRight className="w-3 h-3 mr-0.5" /> Low
                </span>
              )}
              {kpi.trend === 'neutral' && (
                <span className="flex items-center text-slate-500 dark:text-slate-400 text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full shrink-0">
                  <Minus className="w-3 h-3 mr-0.5" /> Normal
                </span>
              )}
              {!kpi.trend && (
                <span className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {kpi.value}
              </div>
              <div className="shrink-0">{renderSparkline(kpi.trend, idx)}</div>
            </div>

            {/* Optional mini progress bar for percentage KPIs */}
            {pct !== null && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    kpi.trend === 'down'
                      ? 'bg-rose-500'
                      : kpi.trend === 'up'
                      ? 'bg-emerald-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}

            {kpi.subtext && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-2">
                {kpi.subtext}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
