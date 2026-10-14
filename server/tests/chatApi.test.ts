import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDatabase, closeDatabase } from '../src/db/connection.js';
import { seedDatabase } from '../src/db/seedData.js';

describe('Chat & Analytics API Integration Tests', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    const db = getDatabase();
    seedDatabase(db, { force: true });
    app = createApp();
  });

  afterAll(() => {
    closeDatabase();
  });

  describe('GET /api/health', () => {
    it('returns 200 with healthy database connection', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('GET /api/analytics/overview', () => {
    it('returns dashboard overview metrics with non-zero counts', async () => {
      const res = await request(app).get('/api/analytics/overview');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCustomers).toBeGreaterThan(0);
      expect(res.body.data.totalBranches).toBe(10);
      expect(res.body.data.totalApplications).toBeGreaterThan(0);
      expect(res.body.data.totalTransactions).toBeGreaterThan(0);
    });
  });

  describe('POST /api/chat', () => {
    it('returns successful analytical report for valid intent', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ question: 'Show monthly onboarding applications by customer segment' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('monthly_onboarding_by_segment');
      expect(res.body.summary).toBeDefined();
      expect(res.body.rows.length).toBeGreaterThan(0);
      expect(res.body.columns.length).toBeGreaterThan(0);
      expect(res.body.chartConfig).toBeDefined();
    });

    it('returns graceful clarification for unsupported intent', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ question: 'Who won the 2022 World Cup?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.intent).toBe('unsupported');
      expect(res.body.summary).toContain('couldn\'t map');
      expect(res.body.suggestedQuestions.length).toBeGreaterThan(0);
    });

    it('returns 400 for empty question string', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ question: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.intent).toBe('validation_error');
    });

    it('returns 400 for missing question property', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for question exceeding 500 characters', async () => {
      const longQuestion = 'a'.repeat(501);
      const res = await request(app)
        .post('/api/chat')
        .send({ question: longQuestion });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exceed 500 characters');
    });

    it('safely processes queries with SQL characters without injection', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ question: "Which branches have the highest rejection rate?'; SELECT 1; --" });

      expect(res.status).toBe(200);
      // It should safely run the branch rejection query without running injected SQL
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('branch_rejection_rate');
    });
  });
});
