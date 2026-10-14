import React, { useState } from 'react';
import {
  Bot,
  User,
  Copy,
  Check,
  FileSpreadsheet,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { Message } from '../types/index.js';
import { KpiCards } from './KpiCards.js';
import { ChartRenderer } from './ChartRenderer.js';
import { DataTable } from './DataTable.js';
import { PromptChips } from './PromptChips.js';

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
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const isUser = message.sender === 'user';

  const copySummaryToClipboard = async () => {
    if (message.response?.summary) {
      await navigator.clipboard.writeText(message.response.summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const copyCsvToClipboard = async () => {
    if (!message.response?.rows || message.response.rows.length === 0) return;

    const columns = message.response.columns || [];
    const headers = columns.map((c) => `"${c.label}"`).join(',');
    const csvRows = message.response.rows.map((row) =>
      columns.map((c) => `"${row[c.key] ?? ''}"`).join(',')
    );

    const csvContent = [headers, ...csvRows].join('\n');
    await navigator.clipboard.writeText(csvContent);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed">
            <p className="font-medium">{message.text}</p>
            <span className="block text-[10px] text-blue-200 mt-1 text-right">
              {message.timestamp}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-700 border border-blue-500/30 flex items-center justify-center shrink-0 shadow">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    );
  }

  // Assistant Loading Skeleton State
  if (message.isLoading) {
    return (
      <div className="flex items-start gap-3.5 mb-6 max-w-3xl">
        <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
        </div>
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="h-3 w-full bg-slate-800/80 rounded animate-pulse" />
          <div className="h-3 w-4/5 bg-slate-800/80 rounded animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-800/60 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Error State
  if (message.isError) {
    return (
      <div className="flex items-start gap-3.5 mb-6 max-w-3xl">
        <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 mt-1">
          <AlertCircle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex-1 bg-rose-950/20 border border-rose-800/40 rounded-2xl p-4 text-sm text-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-rose-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Processing Error
            </span>
            {onRetry && (
              <button
                onClick={() => onRetry(message.text)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/50 text-xs text-rose-200 transition"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            )}
          </div>
          <p className="text-slate-300 text-xs leading-relaxed mb-3">
            {message.errorDetails || 'Failed to process request. Please try again.'}
          </p>
          <PromptChips
            prompts={[
              'Show monthly onboarding applications by customer segment',
              'Which branches have the highest rejection rate?',
              'Show the top five customers by transaction value',
            ]}
            onSelect={onSelectPrompt}
            title="Try asking one of these questions instead:"
          />
        </div>
      </div>
    );
  }

  const resp = message.response;

  return (
    <div className="flex items-start gap-3.5 mb-6 max-w-4xl">
      <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <Bot className="w-4 h-4 text-indigo-400" />
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20 overflow-hidden">
        {/* Header with intent and timestamp */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">
              Analyst Response
            </span>
            {resp?.intent && resp.intent !== 'unsupported' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {resp.intent}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">{message.timestamp}</span>
        </div>

        {/* Natural Language Executive Summary */}
        {resp?.summary && (
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-slate-200 text-xs sm:text-sm leading-relaxed mb-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1">{resp.summary}</div>
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
          <DataTable columns={resp.columns} rows={resp.rows} />
        )}

        {/* Transparent Audited SQL Viewer */}
        {resp?.auditedSql && (
          <div className="mt-3">
            <button
              onClick={() => setShowSql(!showSql)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{showSql ? 'Hide' : 'Inspect'} Audited SQL Template</span>
              {showSql ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showSql && (
              <pre className="mt-2 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400/90 overflow-x-auto whitespace-pre leading-relaxed">
                {resp.auditedSql}
              </pre>
            )}
          </div>
        )}

        {/* Action Toolbar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {resp?.summary && (
              <button
                onClick={copySummaryToClipboard}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition"
                title="Copy Summary Text"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy Answer</span>
                  </>
                )}
              </button>
            )}

            {resp?.rows && resp.rows.length > 0 && (
              <button
                onClick={copyCsvToClipboard}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition"
                title="Copy Table as CSV"
              >
                {copiedCsv ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">CSV Copied!</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3 h-3 text-slate-400" />
                    <span>Copy CSV</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            SQLite Verified Output
          </div>
        </div>

        {/* Suggested Follow-up Questions */}
        {resp?.suggestedQuestions && resp.suggestedQuestions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80">
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
