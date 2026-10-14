import React, { useState, useEffect } from 'react';
import {
  Bot,
  User,
  Copy,
  Check,
  FileSpreadsheet,
  Download,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Star,
  ShieldCheck,
} from 'lucide-react';
import type { Message } from '../types/index.js';
import { KpiCards } from './KpiCards.js';
import { ChartRenderer } from './ChartRenderer.js';
import { DataTable } from './DataTable.js';
import { PromptChips } from './PromptChips.js';
import { downloadCsv, formatCsvString } from '../utils/csvExport.js';
import { useToast } from './Toast.js';

interface ChatMessageProps {
  message: Message;
  onSelectPrompt: (prompt: string) => void;
  onRetry?: (prompt: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectPrompt,
  onRetry,
}) => {
  const { showToast } = useToast();
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const isUser = message.sender === 'user';

  // Multi-phase loading indicator
  useEffect(() => {
    if (!message.isLoading) return;

    const t1 = setTimeout(() => setLoadingStep(1), 350);
    const t2 = setTimeout(() => setLoadingStep(2), 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [message.isLoading]);

  const copySummaryToClipboard = async () => {
    if (message.response?.summary) {
      await navigator.clipboard.writeText(message.response.summary);
      setCopiedSummary(true);
      showToast('Executive answer copied to clipboard', 'success');
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleCopyCsv = async () => {
    if (!message.response?.rows || !message.response.columns) return;
    const csv = formatCsvString(message.response.columns, message.response.rows);
    await navigator.clipboard.writeText(csv);
    setCopiedCsv(true);
    showToast('Table copied as CSV to clipboard', 'success');
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!message.response?.rows || !message.response.columns) return;
    const prefix = message.response.intent || 'banking_analytics';
    downloadCsv(prefix, message.response.columns, message.response.rows);
    showToast(`Downloaded CSV (${message.response.rows.length} rows)`, 'success');
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 animate-slide-up">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed">
            <p className="font-medium">{message.text}</p>
            <span className="block text-[10px] text-blue-200 mt-1 text-right">
              {message.timestamp}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-700 dark:bg-blue-600 border border-blue-500/30 flex items-center justify-center shrink-0 shadow">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    );
  }

  // Assistant Loading Multi-Phase State
  if (message.isLoading) {
    const steps = [
      'Classifying intent & mapping banking domains...',
      'Binding parameters to audited SQL template...',
      'Executing SQLite query & generating interactive cards...',
    ];

    return (
      <div className="flex items-start gap-3.5 mb-6 max-w-3xl animate-slide-up">
        <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
        </div>
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span>{steps[loadingStep]}</span>
          </div>

          <div className="space-y-2">
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-3.5 w-4/5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Error State
  if (message.isError) {
    return (
      <div className="flex items-start gap-3.5 mb-6 max-w-3xl animate-slide-up">
        <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 mt-1">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="flex-1 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-2xl p-4 sm:p-5 text-sm text-slate-800 dark:text-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 text-xs">
              <AlertCircle className="w-4 h-4" /> Processing Clarification
            </span>
            {onRetry && (
              <button
                onClick={() => onRetry(message.text)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-900/70 border border-rose-300 dark:border-rose-700/50 text-xs text-rose-700 dark:text-rose-200 transition font-medium"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-3">
            {message.errorDetails || 'Failed to process analytical request.'}
          </p>
          <PromptChips
            prompts={[
              'Show monthly onboarding applications by customer segment',
              'Which branches have the highest rejection rate?',
              'Show the top five customers by transaction value',
            ]}
            onSelect={onSelectPrompt}
            title="Try asking one of these verified banking questions:"
          />
        </div>
      </div>
    );
  }

  const resp = message.response;

  return (
    <div className="flex items-start gap-3.5 mb-6 max-w-4xl animate-slide-up">
      <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </div>

      <div
        className={`flex-1 bg-white dark:bg-slate-900 border ${
          isPinned
            ? 'border-amber-400/80 shadow-md shadow-amber-500/5'
            : 'border-slate-200 dark:border-slate-800 shadow-sm'
        } rounded-2xl p-4 sm:p-5 overflow-hidden transition-all`}
      >
        {/* Header with intent and actions */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Analyst Response
            </span>
            {resp?.intent && resp.intent !== 'unsupported' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {resp.intent}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {message.timestamp}
            </span>
            <button
              onClick={() => {
                setIsPinned(!isPinned);
                showToast(isPinned ? 'Unpinned message' : 'Message pinned to top', 'info');
              }}
              className={`p-1 rounded-md transition ${
                isPinned ? 'text-amber-500 hover:text-amber-600' : 'hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={isPinned ? 'Unpin message' : 'Pin message'}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Natural Language Executive Summary */}
        {resp?.summary && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/40 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed mb-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{resp.summary}</div>
          </div>
        )}

        {/* KPI Cards */}
        {resp?.kpis && resp.kpis.length > 0 && <KpiCards kpis={resp.kpis} />}

        {/* Interactive Chart */}
        {resp?.chartConfig && resp.rows && resp.rows.length > 0 && (
          <ChartRenderer config={resp.chartConfig} data={resp.rows} />
        )}

        {/* Structured Result Table */}
        {resp?.rows && resp.rows.length > 0 && (
          <DataTable
            columns={resp.columns}
            rows={resp.rows}
            tableName={resp.intent || 'banking_report'}
          />
        )}

        {/* Transparent Audited SQL Viewer */}
        {resp?.auditedSql && (
          <div className="mt-3">
            <button
              onClick={() => setShowSql(!showSql)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold transition"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-500" />
              <span>{showSql ? 'Hide' : 'Inspect'} Audited SQL Template</span>
              {showSql ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showSql && (
              <pre className="mt-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                {resp.auditedSql}
              </pre>
            )}
          </div>
        )}

        {/* Action Toolbar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {resp?.summary && (
              <button
                onClick={copySummaryToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                title="Copy Summary Text"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Answer</span>
                  </>
                )}
              </button>
            )}

            {resp?.rows && resp.rows.length > 0 && (
              <>
                <button
                  onClick={handleCopyCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                  title="Copy Table as CSV"
                >
                  {copiedCsv ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">CSV Copied!</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy CSV</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 transition shadow-sm active:scale-95"
                  title="Download Table as CSV File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>SQLite Verified Output</span>
          </div>
        </div>

        {/* Suggested Follow-up Questions */}
        {resp?.suggestedQuestions && resp.suggestedQuestions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <PromptChips
              prompts={resp.suggestedQuestions}
              onSelect={onSelectPrompt}
              title="Suggested follow-up analyses:"
            />
          </div>
        )}
      </div>
    </div>
  );
};
