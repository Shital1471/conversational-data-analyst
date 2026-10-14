import { Router, type Request, type Response } from 'express';
import { getDatabase } from '../db/connection.js';
import type { DatabaseOverview } from '../types/index.js';

export const analyticsRouter = Router();

analyticsRouter.get('/overview', (_req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const customerCount = (db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number }).count;
    const branchCount = (db.prepare('SELECT COUNT(*) as count FROM branches').get() as { count: number }).count;
    const appCount = (db.prepare('SELECT COUNT(*) as count FROM onboarding_applications').get() as { count: number }).count;

    const approvedCount = (
      db.prepare("SELECT COUNT(*) as count FROM onboarding_applications WHERE status = 'Approved'").get() as { count: number }
    ).count;

    const txStats = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions').get() as {
      count: number;
      total: number;
    };

    const overview: DatabaseOverview = {
      totalCustomers: customerCount,
      totalApplications: appCount,
      totalTransactions: txStats.count,
      totalBranches: branchCount,
      overallApprovalRate: appCount > 0 ? Math.round((approvedCount * 100.0) / appCount * 10) / 10 : 0,
      totalTransactionVolume: Math.round(txStats.total * 100) / 100,
      recentApplicationCount: appCount,
    };

    res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('Failed to query database overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database overview metrics',
    });
  }
});
