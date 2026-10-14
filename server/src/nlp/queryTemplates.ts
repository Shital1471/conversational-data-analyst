import type { DatabaseSync } from 'node:sqlite';
import type { ChatResponse } from '../types/index.js';

export interface QueryExecutionResult {
  response: ChatResponse;
}

export interface QueryTemplate {
  intentId: string;
  sqlTemplate: string;
  execute: (db: DatabaseSync, rawQuestion: string) => ChatResponse;
}

export const QUERY_TEMPLATES: Record<string, QueryTemplate> = {
  monthly_onboarding_by_segment: {
    intentId: 'monthly_onboarding_by_segment',
    sqlTemplate: `
SELECT
  strftime('%Y-%m', oa.application_date) as month,
  c.customer_segment,
  COUNT(*) as application_count
FROM onboarding_applications oa
JOIN customers c ON oa.customer_id = c.id
GROUP BY month, c.customer_segment
ORDER BY month ASC, c.customer_segment ASC;
    `.trim(),
    execute: (db, _question) => {
      const sql = QUERY_TEMPLATES.monthly_onboarding_by_segment.sqlTemplate;
      const rows = db.prepare(sql).all() as {
        month: string;
        customer_segment: string;
        application_count: number;
      }[];

      // Pivot data by month for multi-series charting
      const monthMap = new Map<string, { month: string; Retail: number; SME: number; Corporate: number; Total: number }>();
      let totalRetail = 0;
      let totalSME = 0;
      let totalCorp = 0;

      for (const row of rows) {
        if (!monthMap.has(row.month)) {
          monthMap.set(row.month, { month: row.month, Retail: 0, SME: 0, Corporate: 0, Total: 0 });
        }
        const item = monthMap.get(row.month)!;
        const count = Number(row.application_count);
        if (row.customer_segment === 'Retail') {
          item.Retail = count;
          totalRetail += count;
        } else if (row.customer_segment === 'SME') {
          item.SME = count;
          totalSME += count;
        } else if (row.customer_segment === 'Corporate') {
          item.Corporate = count;
          totalCorp += count;
        }
        item.Total += count;
      }

      const pivotedRows = Array.from(monthMap.values());
      const grandTotal = totalRetail + totalSME + totalCorp;
      const topSegment = totalRetail >= totalSME && totalRetail >= totalCorp ? 'Retail' : totalSME >= totalCorp ? 'SME' : 'Corporate';

      return {
        success: true,
        message: 'Monthly onboarding applications analyzed across all customer segments.',
        intent: 'monthly_onboarding_by_segment',
        visualizationType: 'multi-bar',
        summary: `Across all ${pivotedRows.length} observed months, a total of ${grandTotal.toLocaleString()} onboarding applications were received. Retail remains the largest acquisition segment (${totalRetail} applications, ${Math.round((totalRetail / grandTotal) * 100)}%), followed by SME (${totalSME}) and Corporate (${totalCorp}).`,
        kpis: [
          { label: 'Total Applications', value: grandTotal, subtext: `${pivotedRows.length} months tracking` },
          { label: 'Leading Segment', value: topSegment, subtext: `${Math.round((Math.max(totalRetail, totalSME, totalCorp) / grandTotal) * 100)}% of total volume` },
          { label: 'Retail Volume', value: totalRetail, subtext: 'High-volume personal accounts' },
          { label: 'SME Volume', value: totalSME, subtext: 'Commercial business accounts' },
        ],
        columns: [
          { key: 'month', label: 'Month', format: 'date' },
          { key: 'Retail', label: 'Retail', format: 'number' },
          { key: 'SME', label: 'SME', format: 'number' },
          { key: 'Corporate', label: 'Corporate', format: 'number' },
          { key: 'Total', label: 'Total Applications', format: 'number' },
        ],
        rows: pivotedRows as unknown as Record<string, unknown>[],
        chartConfig: {
          type: 'multi-bar',
          title: 'Monthly Onboarding Application Volume by Customer Segment',
          xAxisKey: 'month',
          yAxisKeys: [
            { key: 'Retail', label: 'Retail', color: '#3b82f6' },
            { key: 'SME', label: 'SME', color: '#10b981' },
            { key: 'Corporate', label: 'Corporate', color: '#8b5cf6' },
          ],
        },
        auditedSql: sql,
      };
    },
  },

  branch_rejection_rate: {
    intentId: 'branch_rejection_rate',
    sqlTemplate: `
SELECT
  b.branch_name,
  b.city,
  b.region,
  COUNT(oa.id) as total_applications,
  SUM(CASE WHEN oa.status = 'Rejected' THEN 1 ELSE 0 END) as rejected_count,
  SUM(CASE WHEN oa.status = 'Approved' THEN 1 ELSE 0 END) as approved_count,
  ROUND(SUM(CASE WHEN oa.status = 'Rejected' THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(oa.id), 1) as rejection_rate
FROM branches b
JOIN onboarding_applications oa ON b.id = oa.branch_id
GROUP BY b.id, b.branch_name, b.city, b.region
ORDER BY rejection_rate DESC;
    `.trim(),
    execute: (db, _question) => {
      const sql = QUERY_TEMPLATES.branch_rejection_rate.sqlTemplate;
      const rows = db.prepare(sql).all() as {
        branch_name: string;
        city: string;
        region: string;
        total_applications: number;
        rejected_count: number;
        approved_count: number;
        rejection_rate: number;
      }[];

      const highestBranch = rows[0];
      const lowestBranch = rows[rows.length - 1];
      const totalApps = rows.reduce((acc, r) => acc + Number(r.total_applications), 0);
      const totalRejected = rows.reduce((acc, r) => acc + Number(r.rejected_count), 0);
      const avgRejection = Math.round((totalRejected * 100.0) / totalApps * 10) / 10;

      return {
        success: true,
        message: 'Branch-wise onboarding rejection rates computed from primary application ledgers.',
        intent: 'branch_rejection_rate',
        visualizationType: 'bar',
        summary: `The branch with the highest rejection rate is ${highestBranch.branch_name} (${highestBranch.city}) at ${highestBranch.rejection_rate}%, with ${highestBranch.rejected_count} rejections out of ${highestBranch.total_applications} applications. In comparison, ${lowestBranch.branch_name} achieved the lowest rejection rate at ${lowestBranch.rejection_rate}%. The network-wide average rejection rate is ${avgRejection}%.`,
        kpis: [
          { label: 'Highest Rejection', value: `${highestBranch.rejection_rate}%`, subtext: highestBranch.branch_name, trend: 'up' },
          { label: 'Lowest Rejection', value: `${lowestBranch.rejection_rate}%`, subtext: lowestBranch.branch_name, trend: 'down' },
          { label: 'Network Average', value: `${avgRejection}%`, subtext: `${totalRejected} rejections of ${totalApps} apps` },
        ],
        columns: [
          { key: 'branch_name', label: 'Branch Name', format: 'text' },
          { key: 'city', label: 'City', format: 'text' },
          { key: 'region', label: 'Region', format: 'text' },
          { key: 'total_applications', label: 'Total Apps', format: 'number' },
          { key: 'rejected_count', label: 'Rejected', format: 'number' },
          { key: 'approved_count', label: 'Approved', format: 'number' },
          { key: 'rejection_rate', label: 'Rejection Rate (%)', format: 'percentage' },
        ],
        rows: rows as unknown as Record<string, unknown>[],
        chartConfig: {
          type: 'bar',
          title: 'Onboarding Rejection Rate by Branch (%)',
          xAxisKey: 'branch_name',
          yAxisKeys: [
            { key: 'rejection_rate', label: 'Rejection Rate (%)', color: '#ef4444' },
          ],
        },
        auditedSql: sql,
      };
    },
  },

  retail_vs_sme_comparison: {
    intentId: 'retail_vs_sme_comparison',
    sqlTemplate: `
SELECT
  c.customer_segment,
  COUNT(oa.id) as total_applications,
  SUM(CASE WHEN oa.status = 'Approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN oa.status = 'Rejected' THEN 1 ELSE 0 END) as rejected_count,
  SUM(CASE WHEN oa.status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
  ROUND(SUM(CASE WHEN oa.status = 'Approved' THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(oa.id), 1) as approval_rate,
  ROUND(SUM(CASE WHEN oa.status = 'Rejected' THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(oa.id), 1) as rejection_rate
FROM customers c
JOIN onboarding_applications oa ON c.id = oa.customer_id
WHERE c.customer_segment IN ('Retail', 'SME')
GROUP BY c.customer_segment;
    `.trim(),
    execute: (db, _question) => {
      const sql = QUERY_TEMPLATES.retail_vs_sme_comparison.sqlTemplate;
      const rows = db.prepare(sql).all() as {
        customer_segment: string;
        total_applications: number;
        approved_count: number;
        rejected_count: number;
        pending_count: number;
        approval_rate: number;
        rejection_rate: number;
      }[];

      const retail = rows.find(r => r.customer_segment === 'Retail') || { total_applications: 0, approval_rate: 0, rejected_count: 0 };
      const sme = rows.find(r => r.customer_segment === 'SME') || { total_applications: 0, approval_rate: 0, rejected_count: 0 };

      const diffVol = Math.abs(Number(retail.total_applications) - Number(sme.total_applications));
      const leader = Number(retail.total_applications) > Number(sme.total_applications) ? 'Retail' : 'SME';

      return {
        success: true,
        message: 'Comparative performance analysis between Retail and SME onboarding operations.',
        intent: 'retail_vs_sme_comparison',
        visualizationType: 'bar',
        summary: `${leader} leads in total onboarding volume with ${leader === 'Retail' ? retail.total_applications : sme.total_applications} applications (+${diffVol} vs counterpart). Retail has an approval rate of ${retail.approval_rate}% compared to SME's ${sme.approval_rate}%. Commercial SME applications typically have stricter underwriting criteria due to credit facility evaluations.`,
        kpis: [
          { label: 'Retail Total Apps', value: retail.total_applications, subtext: `${retail.approval_rate}% approved` },
          { label: 'SME Total Apps', value: sme.total_applications, subtext: `${sme.approval_rate}% approved` },
          { label: 'Retail Approval Rate', value: `${retail.approval_rate}%`, trend: Number(retail.approval_rate) > Number(sme.approval_rate) ? 'up' : 'down' },
          { label: 'SME Approval Rate', value: `${sme.approval_rate}%`, trend: Number(sme.approval_rate) > Number(retail.approval_rate) ? 'up' : 'down' },
        ],
        columns: [
          { key: 'customer_segment', label: 'Customer Segment', format: 'text' },
          { key: 'total_applications', label: 'Total Applications', format: 'number' },
          { key: 'approved_count', label: 'Approved', format: 'number' },
          { key: 'rejected_count', label: 'Rejected', format: 'number' },
          { key: 'pending_count', label: 'Pending', format: 'number' },
          { key: 'approval_rate', label: 'Approval Rate (%)', format: 'percentage' },
          { key: 'rejection_rate', label: 'Rejection Rate (%)', format: 'percentage' },
        ],
        rows: rows as unknown as Record<string, unknown>[],
        chartConfig: {
          type: 'bar',
          title: 'Retail vs SME Application Counts & Approvals',
          xAxisKey: 'customer_segment',
          yAxisKeys: [
            { key: 'total_applications', label: 'Total Applications', color: '#3b82f6' },
            { key: 'approved_count', label: 'Approved Applications', color: '#10b981' },
            { key: 'rejected_count', label: 'Rejected Applications', color: '#ef4444' },
          ],
        },
        auditedSql: sql,
      };
    },
  },

  top_customers_by_value: {
    intentId: 'top_customers_by_value',
    sqlTemplate: `
SELECT
  c.customer_name,
  c.customer_segment,
  COUNT(t.id) as transaction_count,
  ROUND(SUM(t.amount), 2) as total_value,
  ROUND(AVG(t.amount), 2) as average_transaction
FROM customers c
JOIN transactions t ON c.id = t.customer_id
GROUP BY c.id, c.customer_name, c.customer_segment
ORDER BY total_value DESC
LIMIT ?;
    `.trim(),
    execute: (db, question) => {
      // Safe parameter extraction: check if user asked for a specific number like top 10
      let limit = 5;
      const match = question.match(/top\s+(\d+)/i);
      if (match && parseInt(match[1], 10) > 0 && parseInt(match[1], 10) <= 20) {
        limit = parseInt(match[1], 10);
      }

      const sql = QUERY_TEMPLATES.top_customers_by_value.sqlTemplate;
      const rows = db.prepare(sql).all(limit) as {
        customer_name: string;
        customer_segment: string;
        transaction_count: number;
        total_value: number;
        average_transaction: number;
      }[];

      const top1 = rows[0];
      const totalTopValue = rows.reduce((sum, r) => sum + Number(r.total_value), 0);

      return {
        success: true,
        message: `Top ${limit} banking clients ranked by cumulative transaction volume.`,
        intent: 'top_customers_by_value',
        visualizationType: 'bar',
        summary: `The #1 customer by transaction value is ${top1.customer_name} (${top1.customer_segment}) with $${top1.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} across ${top1.transaction_count} transactions. Combined, the top ${rows.length} accounts represent $${totalTopValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in total transaction throughput.`,
        kpis: [
          { label: 'Top Customer', value: top1.customer_name, subtext: `${top1.customer_segment} segment` },
          { label: 'Top Customer Value', value: `$${top1.total_value.toLocaleString()}`, subtext: `${top1.transaction_count} transactions` },
          { label: `Top ${limit} Aggregate`, value: `$${totalTopValue.toLocaleString()}`, subtext: 'High-net-worth portfolio' },
        ],
        columns: [
          { key: 'customer_name', label: 'Customer Name', format: 'text' },
          { key: 'customer_segment', label: 'Segment', format: 'text' },
          { key: 'transaction_count', label: 'Tx Count', format: 'number' },
          { key: 'total_value', label: 'Total Value ($)', format: 'currency' },
          { key: 'average_transaction', label: 'Average Tx ($)', format: 'currency' },
        ],
        rows: rows as unknown as Record<string, unknown>[],
        chartConfig: {
          type: 'bar',
          title: `Top ${limit} Customers by Total Transaction Value ($)`,
          xAxisKey: 'customer_name',
          yAxisKeys: [
            { key: 'total_value', label: 'Total Value ($)', color: '#0ea5e9' },
          ],
        },
        auditedSql: sql.replace('?', String(limit)),
      };
    },
  },

  total_transaction_value_period: {
    intentId: 'total_transaction_value_period',
    sqlTemplate: `
SELECT
  COUNT(*) as transaction_count,
  ROUND(SUM(amount), 2) as total_amount,
  ROUND(AVG(amount), 2) as average_amount,
  ROUND(MIN(amount), 2) as min_amount,
  ROUND(MAX(amount), 2) as max_amount
FROM transactions;
    `.trim(),
    execute: (db, _question) => {
      const aggSql = QUERY_TEMPLATES.total_transaction_value_period.sqlTemplate;
      const agg = db.prepare(aggSql).get() as {
        transaction_count: number;
        total_amount: number;
        average_amount: number;
        min_amount: number;
        max_amount: number;
      };

      // Also get breakdown by transaction type for table & chart
      const typeSql = `
SELECT
  transaction_type,
  COUNT(*) as transaction_count,
  ROUND(SUM(amount), 2) as total_amount,
  ROUND(AVG(amount), 2) as average_amount
FROM transactions
GROUP BY transaction_type
ORDER BY total_amount DESC;
      `.trim();
      const typeRows = db.prepare(typeSql).all() as {
        transaction_type: string;
        transaction_count: number;
        total_amount: number;
        average_amount: number;
      }[];

      return {
        success: true,
        message: 'Comprehensive transaction volume and monetary turnover analysis.',
        intent: 'total_transaction_value_period',
        visualizationType: 'bar',
        summary: `The bank processed a cumulative total of $${Number(agg.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} across ${Number(agg.transaction_count).toLocaleString()} verified transactions. The overall average transaction size is $${Number(agg.average_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, with individual transaction amounts ranging up to $${Number(agg.max_amount).toLocaleString()}.`,
        kpis: [
          { label: 'Total Transaction Value', value: `$${Number(agg.total_amount).toLocaleString()}`, subtext: 'Across all account types' },
          { label: 'Total Transactions', value: Number(agg.transaction_count).toLocaleString(), subtext: 'Settled records' },
          { label: 'Average Transaction', value: `$${Number(agg.average_amount).toLocaleString()}`, subtext: 'Per transaction mean' },
          { label: 'Largest Single Tx', value: `$${Number(agg.max_amount).toLocaleString()}`, subtext: 'Peak high-value transfer' },
        ],
        columns: [
          { key: 'transaction_type', label: 'Transaction Type', format: 'text' },
          { key: 'transaction_count', label: 'Count', format: 'number' },
          { key: 'total_amount', label: 'Total Amount ($)', format: 'currency' },
          { key: 'average_amount', label: 'Average Amount ($)', format: 'currency' },
        ],
        rows: typeRows as unknown as Record<string, unknown>[],
        chartConfig: {
          type: 'bar',
          title: 'Total Transaction Volume by Type ($)',
          xAxisKey: 'transaction_type',
          yAxisKeys: [
            { key: 'total_amount', label: 'Total Amount ($)', color: '#3b82f6' },
          ],
        },
        auditedSql: aggSql,
      };
    },
  },

  application_status_distribution: {
    intentId: 'application_status_distribution',
    sqlTemplate: `
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM onboarding_applications), 1) as percentage
FROM onboarding_applications
GROUP BY status
ORDER BY count DESC;
    `.trim(),
    execute: (db, _question) => {
      const sql = QUERY_TEMPLATES.application_status_distribution.sqlTemplate;
      const rows = db.prepare(sql).all() as {
        status: string;
        count: number;
        percentage: number;
      }[];

      const approved = rows.find(r => r.status === 'Approved') || { count: 0, percentage: 0 };
      const rejected = rows.find(r => r.status === 'Rejected') || { count: 0, percentage: 0 };
      const pending = rows.find(r => r.status === 'Pending') || { count: 0, percentage: 0 };
      const total = rows.reduce((s, r) => s + Number(r.count), 0);

      return {
        success: true,
        message: 'Onboarding application pipeline status and resolution distribution.',
        intent: 'application_status_distribution',
        visualizationType: 'pie',
        summary: `Out of ${total} total onboarding applications, ${approved.count} (${approved.percentage}%) have been approved. ${rejected.count} (${rejected.percentage}%) were rejected following compliance review, and ${pending.count} (${pending.percentage}%) remain under active review in the underwriting pipeline.`,
        kpis: [
          { label: 'Approval Rate', value: `${approved.percentage}%`, subtext: `${approved.count} approved applications`, trend: 'up' },
          { label: 'Rejection Rate', value: `${rejected.percentage}%`, subtext: `${rejected.count} declined applications`, trend: 'down' },
          { label: 'Pending Review', value: `${pending.percentage}%`, subtext: `${pending.count} awaiting decision` },
        ],
        columns: [
          { key: 'status', label: 'Application Status', format: 'status' },
          { key: 'count', label: 'Applications Count', format: 'number' },
          { key: 'percentage', label: 'Share (%)', format: 'percentage' },
        ],
        rows: rows as unknown as Record<string, unknown>[],
        chartConfig: {
          type: 'pie',
          title: 'Application Pipeline Status Distribution',
          xAxisKey: 'status',
          yAxisKeys: [
            { key: 'count', label: 'Applications', color: '#10b981' },
          ],
        },
        auditedSql: sql,
      };
    },
  },

  transaction_value_over_time: {
    intentId: 'transaction_value_over_time',
    sqlTemplate: `
SELECT
  strftime('%Y-%m', transaction_date) as month,
  COUNT(*) as transaction_count,
  ROUND(SUM(amount), 2) as total_value,
  ROUND(AVG(amount), 2) as average_value
FROM transactions
GROUP BY month
ORDER BY month ASC;
    `.trim(),
    execute: (db, _question) => {
      const sql = QUERY_TEMPLATES.transaction_value_over_time.sqlTemplate;
      const rows = db.prepare(sql).all() as {
        month: string;
        transaction_count: number;
        total_value: number;
        average_value: number;
      }[];

      let peakMonth = rows[0];
      let totalAmount = 0;
      let totalCount = 0;

      for (const r of rows) {
        totalAmount += Number(r.total_value);
        totalCount += Number(r.transaction_count);
        if (Number(r.total_value) > Number(peakMonth.total_value)) {
          peakMonth = r;
        }
      }

      return {
        success: true,
        message: 'Monthly transaction value timeline and volume throughput.',
        intent: 'transaction_value_over_time',
        visualizationType: 'line',
        summary: `Transaction activity across ${rows.length} months reached a cumulative value of $${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} across ${totalCount} transactions. The peak volume was recorded in ${peakMonth.month} with $${Number(peakMonth.total_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} transacted.`,
        kpis: [
          { label: 'Cumulative Turnover', value: `$${totalAmount.toLocaleString()}`, subtext: `${rows.length} months tracking` },
          { label: 'Peak Month', value: peakMonth.month, subtext: `$${Number(peakMonth.total_value).toLocaleString()}` },
          { label: 'Avg Monthly Value', value: `$${Math.round(totalAmount / rows.length).toLocaleString()}`, subtext: 'Monthly mean turnover' },
        ],
        columns: [
          { key: 'month', label: 'Month', format: 'date' },
          { key: 'transaction_count', label: 'Tx Count', format: 'number' },
          { key: 'total_value', label: 'Total Value ($)', format: 'currency' },
          { key: 'average_value', label: 'Average Value ($)', format: 'currency' },
        ],
        rows: rows as unknown as Record<string, unknown>[],
        chartConfig: {
          type: 'line',
          title: 'Monthly Transaction Value Trend ($)',
          xAxisKey: 'month',
          yAxisKeys: [
            { key: 'total_value', label: 'Transaction Value ($)', color: '#0ea5e9' },
          ],
        },
        auditedSql: sql,
      };
    },
  },

  application_volume_by_branch: {
    intentId: 'application_volume_by_branch',
    sqlTemplate: `
SELECT
  b.branch_name,
  b.city,
  b.region,
  COUNT(oa.id) as total_applications,
  SUM(CASE WHEN oa.status = 'Approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN oa.status = 'Rejected' THEN 1 ELSE 0 END) as rejected_count,
  SUM(CASE WHEN oa.status = 'Pending' THEN 1 ELSE 0 END) as pending_count
FROM branches b
JOIN onboarding_applications oa ON b.id = oa.branch_id
GROUP BY b.id, b.branch_name, b.city, b.region
ORDER BY total_applications DESC;
    `.trim(),
    execute: (db, _question) => {
      const sql = QUERY_TEMPLATES.application_volume_by_branch.sqlTemplate;
      const rows = db.prepare(sql).all() as {
        branch_name: string;
        city: string;
        region: string;
        total_applications: number;
        approved_count: number;
        rejected_count: number;
        pending_count: number;
      }[];

      const busiest = rows[0];
      const lowest = rows[rows.length - 1];
      const totalAll = rows.reduce((s, r) => s + Number(r.total_applications), 0);

      return {
        success: true,
        message: 'Onboarding application processing volumes by branch.',
        intent: 'application_volume_by_branch',
        visualizationType: 'bar',
        summary: `The highest volume of onboarding applications was recorded at ${busiest.branch_name} (${busiest.city}) with ${busiest.total_applications} applications processed (${busiest.approved_count} approved). ${lowest.branch_name} recorded the lowest volume with ${lowest.total_applications} applications. Total network intake across all branches stands at ${totalAll} applications.`,
        kpis: [
          { label: 'Busiest Branch', value: busiest.branch_name, subtext: `${busiest.total_applications} applications` },
          { label: 'Highest Intake', value: busiest.total_applications, subtext: `${busiest.city} location` },
          { label: 'Network Total', value: totalAll, subtext: 'Applications submitted' },
        ],
        columns: [
          { key: 'branch_name', label: 'Branch Name', format: 'text' },
          { key: 'city', label: 'City', format: 'text' },
          { key: 'region', label: 'Region', format: 'text' },
          { key: 'total_applications', label: 'Total Apps', format: 'number' },
          { key: 'approved_count', label: 'Approved', format: 'number' },
          { key: 'rejected_count', label: 'Rejected', format: 'number' },
          { key: 'pending_count', label: 'Pending', format: 'number' },
        ],
        rows: rows as unknown as Record<string, unknown>[],
        chartConfig: {
          type: 'bar',
          title: 'Total Applications Processed by Branch',
          xAxisKey: 'branch_name',
          yAxisKeys: [
            { key: 'total_applications', label: 'Total Applications', color: '#6366f1' },
            { key: 'approved_count', label: 'Approved', color: '#10b981' },
          ],
        },
        auditedSql: sql,
      };
    },
  },

  branch_approval_rate: {
    intentId: 'branch_approval_rate',
    sqlTemplate: `
SELECT
  b.branch_name,
  b.city,
  b.region,
  COUNT(oa.id) as total_applications,
  SUM(CASE WHEN oa.status = 'Approved' THEN 1 ELSE 0 END) as approved_count,
  ROUND(SUM(CASE WHEN oa.status = 'Approved' THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(oa.id), 1) as approval_rate
FROM branches b
JOIN onboarding_applications oa ON b.id = oa.branch_id
GROUP BY b.id, b.branch_name, b.city, b.region
ORDER BY approval_rate DESC;
    `.trim(),
    execute: (db, _question) => {
      const sql = QUERY_TEMPLATES.branch_approval_rate.sqlTemplate;
      const rows = db.prepare(sql).all() as {
        branch_name: string;
        city: string;
        region: string;
        total_applications: number;
        approved_count: number;
        approval_rate: number;
      }[];

      const highest = rows[0];
      const lowest = rows[rows.length - 1];

      return {
        success: true,
        message: 'Branch-wise onboarding approval rate analysis.',
        intent: 'branch_approval_rate',
        visualizationType: 'bar',
        summary: `${highest.branch_name} has the highest onboarding approval rate at ${highest.approval_rate}% (${highest.approved_count} approved out of ${highest.total_applications}). Conversely, ${lowest.branch_name} recorded the lowest approval rate at ${lowest.approval_rate}%.`,
        kpis: [
          { label: 'Highest Approval Rate', value: `${highest.approval_rate}%`, subtext: highest.branch_name, trend: 'up' },
          { label: 'Lowest Approval Rate', value: `${lowest.approval_rate}%`, subtext: lowest.branch_name, trend: 'down' },
        ],
        columns: [
          { key: 'branch_name', label: 'Branch Name', format: 'text' },
          { key: 'city', label: 'City', format: 'text' },
          { key: 'region', label: 'Region', format: 'text' },
          { key: 'total_applications', label: 'Total Applications', format: 'number' },
          { key: 'approved_count', label: 'Approved Applications', format: 'number' },
          { key: 'approval_rate', label: 'Approval Rate (%)', format: 'percentage' },
        ],
        rows: rows as unknown as Record<string, unknown>[],
        chartConfig: {
          type: 'bar',
          title: 'Application Approval Rate by Branch (%)',
          xAxisKey: 'branch_name',
          yAxisKeys: [
            { key: 'approval_rate', label: 'Approval Rate (%)', color: '#10b981' },
          ],
        },
        auditedSql: sql,
      };
    },
  },
};
