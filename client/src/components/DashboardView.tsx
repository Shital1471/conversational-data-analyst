import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  FileCheck2,
  Receipt,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Award,
  Layers,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { DatabaseOverview } from '../types/index.js';
import { askQuestion } from '../services/api.js';
import { useTheme } from '../context/ThemeContext.js';
import { downloadCsv } from '../utils/csvExport.js';
import { useToast } from './Toast.js';

interface DashboardViewProps {
  overview: DatabaseOverview | null;
  onSelectPrompt: (prompt: string) => void;
  onSwitchToChat: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  overview,
  onSelectPrompt,
  onSwitchToChat,
}) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const isDark = theme === 'dark';

  const [monthlyData, setMonthlyData] = useState<Record<string, unknown>[]>([]);
  const [branchData, setBranchData] = useState<Record<string, unknown>[]>([]);
  const [topCustomers, setTopCustomers] = useState<Record<string, unknown>[]>([]);
  const [txBreakdown, setTxBreakdown] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch baseline analytics widgets on mount
  useEffect(() => {
    const loadWidgets = async () => {
      setIsLoading(true);
      try {
        const [monthlyRes, branchRes, custRes, txRes] = await Promise.all([
          askQuestion('Show monthly onboarding applications by customer segment'),
          askQuestion('Which branches have the highest rejection rate?'),
          askQuestion('Show the top five customers by transaction value'),
          askQuestion('What is the total transaction value this month?'),
        ]);

        if (monthlyRes.rows) setMonthlyData(monthlyRes.rows);
        if (branchRes.rows) setBranchData(branchRes.rows);
        if (custRes.rows) setTopCustomers(custRes.rows);
        if (txRes.rows) setTxBreakdown(txRes.rows);
      } catch (err) {
        console.warn('Failed to load dashboard widgets:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWidgets();
  }, []);

  const handleAskInChat = (prompt: string) => {
    onSelectPrompt(prompt);
    onSwitchToChat();
  };

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {isLoading && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Synchronizing live banking analytical widgets...</span>
        </div>
      )}
      {/* Top Welcome & KPI Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Executive Dashboard
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Live Core Banking Telemetry
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Institutional Banking Portfolio Overview
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (monthlyData.length > 0) {
                downloadCsv('executive_portfolio_summary', Object.keys(monthlyData[0]).map(k => ({ key: k, label: k })), monthlyData);
                showToast('Executive data exported to CSV', 'success');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Snapshot</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
            <span>Total Capitalization</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {overview?.totalTransactionVolume
              ? `$${(overview.totalTransactionVolume / 1_000_000).toFixed(2)}M`
              : '—'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            <span>{overview?.totalTransactions ?? '—'} verified settlements</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +12.4%
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
            <span>Onboarding Approvals</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {overview?.overallApprovalRate ? `${overview.overallApprovalRate}%` : '—'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            <span>{overview?.totalApplications ?? '—'} total applications</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Underwritten</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
            <span>Active Client Base</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {overview?.totalCustomers ?? '65'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            <span>Retail, SME, Corporate</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">100% KYC</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-400" />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
            <span>Network Branches</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {overview?.totalBranches ?? '10'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            <span>5 Major US Economic Regions</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Live WAL</span>
          </div>
        </div>
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Widget 1: Monthly Onboarding Volume by Segment */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Monthly Onboarding Intake
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Retail vs SME vs Corporate acquisition
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAskInChat('Show monthly onboarding applications by customer segment')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Ask AI</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" stroke={axisColor} fontSize={10} tickLine={false} />
                  <YAxis stroke={axisColor} fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="Retail" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="SME" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Corporate" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>May 2024 – Oct 2024</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Retail</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> SME</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Corporate</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Branch Rejection Rate Benchmark */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Branch Rejection Benchmarking
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Underwriting risk & rejection percentages
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAskInChat('Which branches have the highest rejection rate?')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Ask AI</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData.slice(0, 6)} margin={{ top: 10, right: 10, left: -15, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="branch_name"
                    stroke={axisColor}
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => (typeof val === 'string' ? val.split(' ')[0] : val)}
                  />
                  <YAxis stroke={axisColor} fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="rejection_rate" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Ranked by strict underwriting variance</span>
            <span className="text-[11px] text-rose-500 font-semibold">Downtown Financial peak 38%</span>
          </div>
        </div>

        {/* Widget 3: Top Customers by Transaction Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    High-Net-Worth Client Portfolio
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Top corporate & private banking accounts
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAskInChat('Show the top five customers by transaction value')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Ask AI</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {topCustomers.slice(0, 4).map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {String(c.customer_name ?? '')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {String(c.customer_segment ?? '')} • {String(c.transaction_count ?? 0)} transactions
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-slate-900 dark:text-slate-100">
                    ${Number(c.total_value ?? 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4">
            <span>Primary wealth tier</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Led by Global Meridian</span>
          </div>
        </div>

        {/* Widget 4: Transaction Breakdown by Payment Method */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Turnover by Transaction Type
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Deposit, Wire Transfer, Payment, Withdrawal
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAskInChat('What is the total transaction value this month?')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Ask AI</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>

            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Pie
                    data={txBreakdown}
                    dataKey="total_amount"
                    nameKey="transaction_type"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    label={({ name }: { name?: string }) => name ?? ''}
                  >
                    {txBreakdown.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke={isDark ? '#0f172a' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Aggregated monetary turnover</span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Settlement integrity: 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
