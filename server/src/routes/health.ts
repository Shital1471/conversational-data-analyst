import { Router, type Request, type Response } from 'express';
import { getDatabase } from '../db/connection.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    // Verify SQLite connection is responsive
    const result = db.prepare('SELECT 1 as alive').get() as { alive: number };
    const isDbAlive = result?.alive === 1;

    res.status(200).json({
      status: isDbAlive ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: isDbAlive ? 'connected' : 'unresponsive',
      version: '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database ping failed',
    });
  }
});
