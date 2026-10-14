import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ChartConfig } from '../types/index.js';

interface ChartRendererProps {
  config: ChartConfig;
  data: Record<string, unknown>[];
}

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number | string; color?: string }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs backdrop-blur">
        <p className="font-semibold text-slate-200 mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: entry.color || '#3b82f6' }}
                />
                {entry.name}:
              </span>
              <span className="font-medium text-slate-100">
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
  if (!data || data.length === 0) return null;

  return (
    <div className="my-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 tracking-tight">
          {config.title}
        </h3>
        <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
          Relational Viz
        </span>
      </div>

      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {config.type === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey={config.xAxisKey}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                dy={10}
              />
              <YAxis
                stroke="#64748b"
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
              <Tooltip content={<CustomTooltip />} />
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
          ) : config.type === 'pie' ? (
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
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
                innerRadius={60}
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
                  />
                ))}
              </Pie>
            </PieChart>
          ) : (
            // Bar and Multi-bar chart
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey={config.xAxisKey}
                stroke="#64748b"
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
                stroke="#64748b"
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
              <Tooltip content={<CustomTooltip />} />
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
                  radius={[4, 4, 0, 0]}
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
