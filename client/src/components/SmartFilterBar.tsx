import React from 'react';
import { Filter, RotateCcw, Sparkles } from 'lucide-react';

export interface FilterState {
  segment: string;
  region: string;
  metricFocus: string;
}

interface SmartFilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onApplyPrompt: (prompt: string) => void;
}

export const SmartFilterBar: React.FC<SmartFilterBarProps> = ({
  filters,
  onChange,
  onApplyPrompt,
}) => {
  const segments = ['All Segments', 'Retail', 'SME', 'Corporate'];
  const regions = ['All Regions', 'Northeast', 'Midwest', 'West', 'Southeast', 'Southwest'];
  const metrics = ['All Metrics', 'Onboarding Volumes', 'Branch Rejections', 'High-Value Customers', 'Transaction Turnover'];

  const hasActiveFilters =
    filters.segment !== 'All Segments' ||
    filters.region !== 'All Regions' ||
    filters.metricFocus !== 'All Metrics';

  const handleReset = () => {
    onChange({
      segment: 'All Segments',
      region: 'All Regions',
      metricFocus: 'All Metrics',
    });
  };

  const handleQuickAnalysis = () => {
    if (filters.metricFocus === 'Branch Rejections') {
      onApplyPrompt('Which branches have the highest rejection rate?');
    } else if (filters.metricFocus === 'High-Value Customers') {
      onApplyPrompt('Show the top five customers by transaction value');
    } else if (filters.metricFocus === 'Transaction Turnover') {
      onApplyPrompt('What is the total transaction value this month?');
    } else if (filters.segment === 'Retail') {
      onApplyPrompt('Compare retail and SME onboarding volumes');
    } else {
      onApplyPrompt('Show monthly onboarding applications by customer segment');
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-2.5 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Filters Group */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            <span>Smart Filter:</span>
          </div>

          {/* Segment Selector */}
          <select
            value={filters.segment}
            onChange={(e) => onChange({ ...filters, segment: e.target.value })}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            {segments.map((s) => (
              <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {s}
              </option>
            ))}
          </select>

          {/* Region Selector */}
          <select
            value={filters.region}
            onChange={(e) => onChange({ ...filters, region: e.target.value })}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r} value={r} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {r}
              </option>
            ))}
          </select>

          {/* Metric Focus */}
          <select
            value={filters.metricFocus}
            onChange={(e) => onChange({ ...filters, metricFocus: e.target.value })}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 transition hidden sm:inline-block cursor-pointer"
          >
            {metrics.map((m) => (
              <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {m}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition ml-1"
              title="Reset Filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Quick Query Generator Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickAnalysis}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:border-blue-500/40 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Focused Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
};
