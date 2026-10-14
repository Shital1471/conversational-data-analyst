import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat.js';
import { healthRouter } from './routes/health.js';
import { analyticsRouter } from './routes/analytics.js';

export function createApp() {
  const app = express();

  // Basic security hardening headers
  app.disable('x-powered-by');
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // CORS configuration
  app.use(cors({
    origin: '*', // Can be restricted in production
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // JSON body parser with strictly enforced reasonable limit
  app.use(express.json({ limit: '100kb' }));

  // API Routes
  app.use('/api', healthRouter);
  app.use('/api', chatRouter);
  app.use('/api/analytics', analyticsRouter);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Resource not found',
    });
  });

  // Global safe error handler - prevents leaking stack traces
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled internal application error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  });

  return app;
}
