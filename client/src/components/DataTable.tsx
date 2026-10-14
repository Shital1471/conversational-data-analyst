import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  Search,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import type { ColumnDefinition } from '../types/index.js';
import { downloadCsv, formatCsvString } from '../utils/csvExport.js';
import { useToast } from './Toast.js';

interface DataTableProps {
  columns: ColumnDefinition[];
  rows: Record<string, unknown>[];
  tableName?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  tableName = 'banking_analytics_ledger',
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [copied, setCopied] = useState(false);

  // Filter & Sort
  const processedRows = useMemo(() => {
    let result = [...rows];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(lower)
        )
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA ?? '');
        const strB = String(valB ?? '');
        return sortDirection === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [rows, searchTerm, sortKey, sortDirection]);

  // Pagination calculation
  const totalPages = pageSize === -1 ? 1 : Math.ceil(processedRows.length / pageSize);
  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return processedRows;
    const start = (currentPage - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const handleDownloadCsv = () => {
    downloadCsv(tableName, columns, processedRows);
    showToast(`Downloaded CSV (${processedRows.length} rows)`, 'success');
  };

  const handleCopyCsv = async () => {
    const csv = formatCsvString(columns, processedRows);
    await navigator.clipboard.writeText(csv);
    setCopied(true);
    showToast('Table data copied as CSV to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCellValue = (val: unknown, format?: ColumnDefinition['format']) => {
    if (val === null || val === undefined) return '—';

    if (format === 'currency') {
      const num = typeof val === 'number' ? val : parseFloat(String(val));
      return isNaN(num)
        ? String(val)
        : `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (format === 'percentage') {
      return `${val}%`;
    }

    if (format === 'number') {
      const num = typeof val === 'number' ? val : parseFloat(String(val));
      return isNaN(num) ? String(val) : num.toLocaleString();
    }

    if (format === 'status') {
      const statusStr = String(val);
      const isApproved = statusStr.toLowerCase() === 'approved';
      const isRejected = statusStr.toLowerCase() === 'rejected';
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            isApproved
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : isRejected
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isApproved
                ? 'bg-emerald-500 dark:bg-emerald-400'
                : isRejected
                ? 'bg-rose-500 dark:bg-rose-400'
                : 'bg-amber-500 dark:bg-amber-400'
            }`}
          />
          {statusStr}
        </span>
      );
    }

    return String(val);
  };

  if (!rows || rows.length === 0) return null;

  return (
    <div className="my-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors">
      {/* Table toolbar */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap bg-slate-50/50 dark:bg-slate-950/30">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Result Ledger
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {processedRows.length} rows
          </span>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Copy CSV button */}
          <button
            onClick={handleCopyCsv}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
            title="Copy Table as CSV"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy CSV'}</span>
          </button>

          {/* Direct CSV Download button */}
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 transition shadow-sm active:scale-95"
            title="Download CSV File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold sticky top-0 z-10 backdrop-blur">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-2.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition duration-100"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                    >
                      {formatCellValue(row[col.key], col.format)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {processedRows.length > 10 && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={-1}>All</option>
            </select>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {pageSize !== -1 && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
