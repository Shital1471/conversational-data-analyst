import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { initializeSchema } from '../src/db/schema.js';
import { seedDatabase } from '../src/db/seedData.js';
import { QueryInterpreter } from '../src/nlp/interpreter.js';

describe('QueryInterpreter Unit Tests', () => {
  let db: DatabaseSync;
  let interpreter: QueryInterpreter;

  beforeAll(() => {
    // Use an isolated in-memory SQLite database for high-speed reproducible testing
    db = new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys = ON;');
    initializeSchema(db);
    seedDatabase(db, { force: true });
    interpreter = new QueryInterpreter(db);
  });

  afterAll(() => {
    db.close();
  });

  it('correctly matches and executes "monthly onboarding by segment"', () => {
    const res = interpreter.processQuery('Show monthly onboarding applications by customer segment');
    expect(res.success).toBe(true);
    expect(res.intent).toBe('monthly_onboarding_by_segment');
    expect(res.visualizationType).toBe('multi-bar');
    expect(res.rows.length).toBeGreaterThan(0);
    expect(res.columns.some(c => c.key === 'Retail')).toBe(true);
    expect(res.kpis).toBeDefined();
    expect(res.kpis!.length).toBeGreaterThan(0);
  });

  it('correctly matches and executes "branch rejection rate"', () => {
    const res = interpreter.processQuery('Which branches have the highest rejection rate?');
    expect(res.success).toBe(true);
    expect(res.intent).toBe('branch_rejection_rate');
    expect(res.visualizationType).toBe('bar');
    expect(res.rows.length).toBe(10);
    // Highest rejection branch should be first
    const firstRow = res.rows[0] as { rejection_rate: number; branch_name: string };
    const lastRow = res.rows[res.rows.length - 1] as { rejection_rate: number };
    expect(firstRow.rejection_rate).toBeGreaterThanOrEqual(lastRow.rejection_rate);
  });

  it('correctly matches and executes "retail vs sme comparison"', () => {
    const res = interpreter.processQuery('Compare retail and SME onboarding volumes');
    expect(res.success).toBe(true);
    expect(res.intent).toBe('retail_vs_sme_comparison');
    expect(res.rows.length).toBe(2);
    expect(res.kpis).toBeDefined();
  });

  it('correctly matches and executes "top customers by value"', () => {
    const res = interpreter.processQuery('Show the top five customers by transaction value');
    expect(res.success).toBe(true);
    expect(res.intent).toBe('top_customers_by_value');
    expect(res.rows.length).toBe(5);
    const top1 = res.rows[0] as { total_value: number };
    const top2 = res.rows[1] as { total_value: number };
    expect(top1.total_value).toBeGreaterThanOrEqual(top2.total_value);
  });

  it('correctly matches and executes "total transaction value this month"', () => {
    const res = interpreter.processQuery('What is the total transaction value this month?');
    expect(res.success).toBe(true);
    expect(res.intent).toBe('total_transaction_value_period');
    expect(res.kpis).toBeDefined();
    expect(res.rows.length).toBeGreaterThan(0);
  });

  it('correctly matches and executes "application status distribution"', () => {
    const res = interpreter.processQuery('Show application status distribution');
    expect(res.success).toBe(true);
    expect(res.intent).toBe('application_status_distribution');
    expect(res.visualizationType).toBe('pie');
    expect(res.rows.some(r => (r as { status: string }).status === 'Approved')).toBe(true);
  });

  it('correctly matches and executes "transaction value over time"', () => {
    const res = interpreter.processQuery('Show transaction value over time');
    expect(res.success).toBe(true);
    expect(res.intent).toBe('transaction_value_over_time');
    expect(res.visualizationType).toBe('line');
    expect(res.rows.length).toBeGreaterThan(0);
  });

  it('correctly matches and executes "application volume by branch"', () => {
    const res = interpreter.processQuery('Show application volume by branch');
    expect(res.success).toBe(true);
    expect(res.intent).toBe('application_volume_by_branch');
    expect(res.rows.length).toBe(10);
  });

  it('gracefully handles unsupported questions with helpful suggestions', () => {
    const res = interpreter.processQuery('What is the weather in Paris today?');
    expect(res.success).toBe(false);
    expect(res.intent).toBe('unsupported');
    expect(res.summary).toContain('couldn\'t map');
    expect(res.suggestedQuestions).toBeDefined();
    expect(res.suggestedQuestions!.length).toBeGreaterThan(0);
  });

  it('gracefully handles empty question', () => {
    const res = interpreter.processQuery('   ');
    expect(res.success).toBe(false);
    expect(res.intent).toBe('unsupported');
  });

  it('safely handles malicious SQL injection attempts', () => {
    const malicious = "Show top customers'; DROP TABLE customers; --";
    const res = interpreter.processQuery(malicious);
    // Either matched intent safely or flagged unsupported, but DB must be intact
    const countCheck = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
    expect(countCheck.count).toBeGreaterThan(0);
  });
});
