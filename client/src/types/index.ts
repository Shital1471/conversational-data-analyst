export type CustomerSegment = 'Retail' | 'SME' | 'Corporate';
export type ApplicationStatus = 'Approved' | 'Rejected' | 'Pending';
export type TransactionType = 'Deposit' | 'Withdrawal' | 'Transfer' | 'Payment';

export type VisualizationType = 'bar' | 'line' | 'pie' | 'table' | 'kpi' | 'multi-bar' | 'none';

export interface KPI {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartConfig {
  type: VisualizationType;
  title: string;
  xAxisKey: string;
  yAxisKeys: {
    key: string;
    label: string;
    color: string;
  }[];
  isStacked?: boolean;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  format?: 'currency' | 'percentage' | 'number' | 'date' | 'status' | 'text';
}

export interface ChatResponse {
  success: boolean;
  message: string;
  intent: string;
  visualizationType: VisualizationType;
  summary: string;
  kpis?: KPI[];
  columns: ColumnDefinition[];
  rows: Record<string, unknown>[];
  chartConfig?: ChartConfig;
  auditedSql?: string;
  suggestedQuestions?: string[];
}

export interface DatabaseOverview {
  totalCustomers: number;
  totalApplications: number;
  totalTransactions: number;
  totalBranches: number;
  overallApprovalRate: number;
  totalTransactionVolume: number;
  recentApplicationCount: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  response?: ChatResponse;
  isLoading?: boolean;
  isError?: boolean;
  errorDetails?: string;
}
