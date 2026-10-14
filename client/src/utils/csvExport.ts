import type { ColumnDefinition } from '../types/index.js';

export function formatCsvString(
  columns: ColumnDefinition[],
  rows: Record<string, unknown>[]
): string {
  if (!columns.length || !rows.length) return '';

  const headers = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');
  const rowLines = rows.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',')
  );

  return [headers, ...rowLines].join('\n');
}

export function downloadCsv(
  filenamePrefix: string,
  columns: ColumnDefinition[],
  rows: Record<string, unknown>[]
): void {
  const csvContent = formatCsvString(columns, rows);
  if (!csvContent) return;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const timestamp = new Date().toISOString().slice(0, 10);
  const cleanPrefix = filenamePrefix
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 30);
  link.setAttribute('href', url);
  link.setAttribute('download', `${cleanPrefix}_${timestamp}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
