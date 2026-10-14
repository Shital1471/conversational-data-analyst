import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Layers, Download } from 'lucide-react';
import type { ChartConfig } from '../types/index.js';
import { useTheme } from '../context/ThemeContext.js';
import { downloadCsv } from '../utils/csvExport.js';
import { useToast } from './Toast.js';

interface ChartRendererProps {
  config: ChartConfig;
  data: Record<string, unknown>[];
}

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number | string; color?: string }>;
  label?: string;
  isDark: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`p-3 rounded-xl shadow-xl text-xs backdrop-blur-md border ${
          isDark
            ? 'bg-slate-900/95 border-slate-700/80 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200'
        }`}
      >
        <p className="font-bold mb-2 pb-1 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-5">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || '#3b82f6' }}
                />
                {entry.name}:
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {typeof entry.value === 'number'
                  ? entry.value >= 1000
                    ? entry.value.toLocaleString()
                    : entry.value
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ChartRenderer: React.FC<ChartRendererProps> = ({ config, data }) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const isDark = theme === 'dark';

  // Allow switching chart display type dynamically!
  const [chartType, setChartType] = useState<string>(config.type);

  if (!data || data.length === 0) return null;

  const handleDownloadCsv = () => {
    const cols = Object.keys(data[0] || {}).map((k) => ({
      key: k,
      label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    }));
    downloadCsv(config.title, cols, data);
    showToast(`Downloaded CSV dataset for ${config.title}`, 'success');
  };

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const axisColor = isDark ? '#64748b' : '#94a3b8';

  return (
    <div className="my-5 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Chart Header & Interactive Controls */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            {chartType === 'line' || chartType === 'area' ? (
              <TrendingUp className="w-4 h-4" />
            ) : chartType === 'pie' ? (
              <PieIcon className="w-4 h-4" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {config.title}
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Interactive Banking Analytics
            </span>
          </div>
        </div>

        {/* View Switchers & Export Toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
          {config.type !== 'pie' && (
            <>
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  chartType === 'bar' || chartType === 'multi-bar'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Bar Chart View"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  chartType === 'area'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Area Trend View"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('stacked')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  chartType === 'stacked'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Stacked Chart View"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

          <button
            onClick={handleDownloadCsv}
            className="p-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
            title="Export Chart Data as CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Pie
                data={data}
                dataKey={config.yAxisKeys[0]?.key || 'count'}
                nameKey={config.xAxisKey}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                    stroke={isDark ? '#0f172a' : '#ffffff'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          ) : chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <defs>
                {config.yAxisKeys.map((y, idx) => (
                  <linearGradient key={y.key} id={`color-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={y.color || '#3b82f6'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={y.color || '#3b82f6'} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey={config.xAxisKey}
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                dy={10}
              />
              <YAxis
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) =>
                  val >= 1000000
                    ? `$${(val / 1000000).toFixed(1)}M`
                    : val >= 1000
                    ? `${val / 1000}k`
                    : `${val}`
                }
              />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              {config.yAxisKeys.map((y, idx) => (
                <Area
                  key={y.key}
                  type="monotone"
                  dataKey={y.key}
                  name={y.label}
                  stroke={y.color || '#3b82f6'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#color-${idx})`}
                />
              ))}
            </AreaChart>
          ) : chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey={config.xAxisKey}
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                dy={10}
              />
              <YAxis
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) =>
                  val >= 1000000
                    ? `$${(val / 1000000).toFixed(1)}M`
                    : val >= 1000
                    ? `$${(val / 1000).toFixed(0)}k`
                    : `${val}`
                }
              />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              {config.yAxisKeys.map((y) => (
                <Line
                  key={y.key}
                  type="monotone"
                  dataKey={y.key}
                  name={y.label}
                  stroke={y.color || '#3b82f6'}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: y.color || '#3b82f6' }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          ) : (
            // Bar / Multi-bar / Stacked Bar
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey={config.xAxisKey}
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                dy={10}
                tickFormatter={(val) =>
                  typeof val === 'string' && val.length > 14
                    ? `${val.substring(0, 13)}…`
                    : `${val}`
                }
              />
              <YAxis
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) =>
                  val >= 1000000
                    ? `$${(val / 1000000).toFixed(1)}M`
                    : val >= 1000
                    ? `${val / 1000}k`
                    : `${val}`
                }
              />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              {config.yAxisKeys.map((y) => (
                <Bar
                  key={y.key}
                  dataKey={y.key}
                  name={y.label}
                  fill={y.color || '#3b82f6'}
                  stackId={chartType === 'stacked' ? 'a' : undefined}
                  radius={chartType === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  maxBarSize={50}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
