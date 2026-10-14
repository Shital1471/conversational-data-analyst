import { DatabaseSync } from 'node:sqlite';
import { config } from '../config/env.js';

let dbInstance: DatabaseSync | null = null;

export function getDatabase(customPath?: string): DatabaseSync {
  if (customPath) {
    const db = new DatabaseSync(customPath);
    db.exec('PRAGMA foreign_keys = ON;');
    return db;
  }

  if (!dbInstance) {
    dbInstance = new DatabaseSync(config.databasePath);
    // Enforce relational foreign key integrity
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    // Enable Write-Ahead Logging for better concurrency
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  }

  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
    dbInstance = null;
  }
}
