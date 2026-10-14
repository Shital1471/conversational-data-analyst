import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import type { ColumnDefinition } from '../types/index.js';

interface DataTableProps {
  columns: ColumnDefinition[];
  rows: Record<string, unknown>[];
}

export const DataTable: React.FC<DataTableProps> = ({ columns, rows }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredRows = useMemo(() => {
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

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const formatCellValue = (val: unknown, format?: ColumnDefinition['format']) => {
    if (val === null || val === undefined) return '—';

    if (format === 'currency') {
      const num = typeof val === 'number' ? val : parseFloat(String(val));
      return isNaN(num) ? String(val) : `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
            isApproved
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : isRejected
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isApproved
                ? 'bg-emerald-400'
                : isRejected
                ? 'bg-rose-400'
                : 'bg-amber-400'
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
    <div className="my-4 rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-sm">
      {/* Table toolbar */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs font-semibold text-slate-300">
          Result Ledger ({filteredRows.length} rows)
        </div>

        {rows.length > 5 && (
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Table body */}
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold sticky top-0 z-10 backdrop-blur">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-2.5 cursor-pointer hover:text-slate-200 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600 hover:text-slate-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-800/50 transition duration-100"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 text-slate-300">
                    {formatCellValue(row[col.key], col.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
