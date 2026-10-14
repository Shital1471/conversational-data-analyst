export type CustomerSegment = 'Retail' | 'SME' | 'Corporate';
export type ApplicationStatus = 'Approved' | 'Rejected' | 'Pending';
export type TransactionType = 'Deposit' | 'Withdrawal' | 'Transfer' | 'Payment';

export interface Customer {
  id: number;
  customer_name: string;
  customer_segment: CustomerSegment;
  created_at: string;
}

export interface Branch {
  id: number;
  branch_name: string;
  city: string;
  region: string;
}

export interface OnboardingApplication {
  id: number;
  customer_id: number;
  branch_id: number;
  application_date: string;
  status: ApplicationStatus;
  rejection_reason: string | null;
}

export interface Transaction {
  id: number;
  customer_id: number;
  branch_id: number;
  transaction_date: string;
  amount: number;
  transaction_type: TransactionType;
  currency: string;
}

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
  auditedSql?: string; // Transparent inspected audited template
  suggestedQuestions?: string[];
}

export interface ChatRequest {
  question: string;
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
