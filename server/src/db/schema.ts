import type { DatabaseSync } from 'node:sqlite';

export const SCHEMA_SQL = `
-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  customer_segment TEXT NOT NULL CHECK(customer_segment IN ('Retail', 'SME', 'Corporate')),
  created_at TEXT NOT NULL
);

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_name TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  region TEXT NOT NULL
);

-- Onboarding Applications table
CREATE TABLE IF NOT EXISTS onboarding_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  application_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Approved', 'Rejected', 'Pending')),
  rejection_reason TEXT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  transaction_date TEXT NOT NULL,
  amount REAL NOT NULL,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN ('Deposit', 'Withdrawal', 'Transfer', 'Payment')),
  currency TEXT NOT NULL DEFAULT 'USD'
);

-- Indexes for analytical performance
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(customer_segment);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

CREATE INDEX IF NOT EXISTS idx_branches_region ON branches(region);

CREATE INDEX IF NOT EXISTS idx_apps_customer ON onboarding_applications(customer_id);
CREATE INDEX IF NOT EXISTS idx_apps_branch ON onboarding_applications(branch_id);
CREATE INDEX IF NOT EXISTS idx_apps_date ON onboarding_applications(application_date);
CREATE INDEX IF NOT EXISTS idx_apps_status ON onboarding_applications(status);

CREATE INDEX IF NOT EXISTS idx_tx_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_tx_branch ON transactions(branch_id);
CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(transaction_type);
`;

export function initializeSchema(db: DatabaseSync): void {
  db.exec(SCHEMA_SQL);
}

export function dropTables(db: DatabaseSync): void {
  db.exec(`
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS onboarding_applications;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS branches;
  `);
}
