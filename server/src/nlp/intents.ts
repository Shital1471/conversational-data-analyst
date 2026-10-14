import type { VisualizationType } from '../types/index.js';

export interface IntentDefinition {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  patterns: RegExp[];
  exampleQuestions: string[];
  relevantTables: string[];
  defaultVisualization: VisualizationType;
}

export const SUPPORTED_INTENTS: IntentDefinition[] = [
  {
    id: 'monthly_onboarding_by_segment',
    name: 'Monthly Onboarding by Customer Segment',
    description: 'Calculates onboarding application volumes broken down by month and customer segment (Retail, SME, Corporate).',
    keywords: ['monthly', 'onboarding', 'segment', 'customer segment', 'retail', 'sme', 'corporate', 'applications by segment'],
    patterns: [
      /monthly.*onboarding.*segment/i,
      /onboarding.*(applications|volume).*by.*segment/i,
      /segment.*onboarding/i,
      /applications.*by.*(customer\s+)?segment/i,
      /breakdown.*onboarding.*segment/i
    ],
    exampleQuestions: [
      'Show monthly onboarding applications by customer segment',
      'What is the monthly onboarding volume by customer segment?',
      'Breakdown onboarding applications by segment over time'
    ],
    relevantTables: ['onboarding_applications', 'customers'],
    defaultVisualization: 'multi-bar',
  },
  {
    id: 'branch_rejection_rate',
    name: 'Branch-Wise Rejection Rate',
    description: 'Ranks bank branches by their onboarding application rejection percentage with total and rejected counts.',
    keywords: ['branch', 'rejection', 'reject', 'highest rejection', 'rejection rate', 'rejections by branch'],
    patterns: [
      /(which|what).*branch(es)?.*(highest|lowest|most).*rejection/i,
      /branch(-|\s+)wise.*rejection(\s+rate)?/i,
      /rejection\s+rate.*by.*branch/i,
      /branches.*(with|having).*rejection/i,
      /highest.*rejection.*rate/i
    ],
    exampleQuestions: [
      'Which branches have the highest rejection rate?',
      'Show the branch-wise rejection rate',
      'What is the application rejection rate by branch?'
    ],
    relevantTables: ['onboarding_applications', 'branches'],
    defaultVisualization: 'bar',
  },
  {
    id: 'retail_vs_sme_comparison',
    name: 'Retail vs SME Onboarding Comparison',
    description: 'Compares onboarding volume, approval rates, and rejection numbers between Retail and SME customer segments.',
    keywords: ['compare', 'retail', 'sme', 'retail versus sme', 'retail vs sme', 'onboarding volumes'],
    patterns: [
      /compare.*retail.*(and|vs|versus).*sme/i,
      /retail.*(vs|versus).*sme.*onboarding/i,
      /sme.*(vs|versus).*retail/i,
      /comparison.*between.*retail.*sme/i
    ],
    exampleQuestions: [
      'Compare retail and SME onboarding volumes',
      'How does retail onboarding compare to SME?',
      'Retail vs SME onboarding comparison'
    ],
    relevantTables: ['onboarding_applications', 'customers'],
    defaultVisualization: 'bar',
  },
  {
    id: 'top_customers_by_value',
    name: 'Top Customers by Transaction Value',
    description: 'Identifies the highest-value banking customers ranked by aggregated transaction amounts and activity counts.',
    keywords: ['top', 'customers', 'transaction value', 'highest value', 'top five', 'top 5', 'biggest customers'],
    patterns: [
      /top\s+(five|5|ten|10)?\s*customers.*(by\s+)?(transaction\s+)?value/i,
      /highest.*value.*customers/i,
      /customers.*with.*highest.*transactions?/i,
      /who.*(are|is).*top.*customers?/i
    ],
    exampleQuestions: [
      'Show the top five customers by transaction value',
      'Who are our top customers by transaction volume?',
      'Top 5 customers by total transaction amount'
    ],
    relevantTables: ['transactions', 'customers'],
    defaultVisualization: 'bar',
  },
  {
    id: 'total_transaction_value_period',
    name: 'Total Transaction Value and Volume',
    description: 'Aggregates overall transaction turnover, total transaction count, average size, and breakdown by payment type.',
    keywords: ['total transaction', 'transaction value', 'this month', 'turnover', 'total volume', 'amount this month'],
    patterns: [
      /total\s+transaction\s+value(\s+this\s+month)?/i,
      /what\s+is\s+the\s+total\s+transaction\s+value/i,
      /total\s+amount\s+of\s+transactions/i,
      /transaction\s+turnover/i,
      /how\s+much\s+(money|value)\s+transacted/i
    ],
    exampleQuestions: [
      'What is the total transaction value this month?',
      'Show total transaction value and breakdown',
      'What is the total transaction volume across all accounts?'
    ],
    relevantTables: ['transactions'],
    defaultVisualization: 'kpi',
  },
  {
    id: 'application_status_distribution',
    name: 'Application Status Distribution',
    description: 'Analyzes the overall proportions and counts of Approved, Rejected, and Pending onboarding applications.',
    keywords: ['status', 'distribution', 'approval rate', 'approved', 'rejected', 'pending', 'application status'],
    patterns: [
      /application\s+status\s+distribution/i,
      /distribution\s+of\s+(application\s+)?status/i,
      /how\s+many\s+applications\s+(are\s+)?(approved|rejected|pending)/i,
      /breakdown\s+of\s+applications\s+by\s+status/i,
      /overall\s+approval\s+rate/i
    ],
    exampleQuestions: [
      'Show application status distribution',
      'What is the overall approval rate vs rejection rate?',
      'Breakdown of onboarding applications by status'
    ],
    relevantTables: ['onboarding_applications'],
    defaultVisualization: 'pie',
  },
  {
    id: 'transaction_value_over_time',
    name: 'Transaction Value Over Time',
    description: 'Plots the chronological trend of transaction volumes and amounts by month.',
    keywords: ['transaction value over time', 'trend', 'monthly transactions', 'transactions over time', 'transaction trend'],
    patterns: [
      /transaction(s)?\s+(value|volume)?\s*over\s+time/i,
      /monthly\s+transaction\s+trend/i,
      /transaction\s+history\s+by\s+month/i,
      /trend\s+of\s+transactions/i
    ],
    exampleQuestions: [
      'Show transaction value over time',
      'What is the monthly transaction trend?',
      'How has transaction value evolved over the months?'
    ],
    relevantTables: ['transactions'],
    defaultVisualization: 'line',
  },
  {
    id: 'application_volume_by_branch',
    name: 'Application Volume by Branch',
    description: 'Displays the total onboarding application intake and approval count for each branch.',
    keywords: ['volume by branch', 'applications by branch', 'branch volume', 'branch onboarding', 'busiest branch'],
    patterns: [
      /(application\s+)?volume\s+by\s+branch/i,
      /applications\s+(received\s+)?by\s+branch/i,
      /show\s+applications?\s+for\s+each\s+branch/i,
      /which\s+branch(es)?\s+(received|has|handles)\s+the\s+most\s+applications/i,
      /branch\s+application\s+count/i
    ],
    exampleQuestions: [
      'Show application volume by branch',
      'Which branches received the most onboarding applications?',
      'Application count for each branch'
    ],
    relevantTables: ['onboarding_applications', 'branches'],
    defaultVisualization: 'bar',
  },
  {
    id: 'branch_approval_rate',
    name: 'Branch-Wise Approval Rate',
    description: 'Analyzes onboarding application approval rates by branch location.',
    keywords: ['approval rate by branch', 'branch approval rate', 'highest approval', 'approval rate'],
    patterns: [
      /approval\s+rate\s+by\s+branch/i,
      /branch(-|\s+)wise\s+approval\s+rate/i,
      /which\s+branch.*highest\s+approval\s+rate/i
    ],
    exampleQuestions: [
      'Show the application approval rate by branch',
      'Which branches have the highest approval rate?'
    ],
    relevantTables: ['onboarding_applications', 'branches'],
    defaultVisualization: 'bar',
  }
];
