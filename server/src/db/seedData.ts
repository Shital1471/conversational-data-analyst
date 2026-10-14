import type { DatabaseSync } from 'node:sqlite';
import { initializeSchema } from './schema.js';

// Deterministic Pseudo-Random Number Generator (Mulberry32) for reproducibility
function createPrng(seed: number) {
  let s = seed;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedDatabase(db: DatabaseSync, options: { force?: boolean } = {}): {
  customersCount: number;
  branchesCount: number;
  applicationsCount: number;
  transactionsCount: number;
} {
  initializeSchema(db);

  // Check if data already exists and force is false
  const existingCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
  if (existingCustomers.count > 0 && !options.force) {
    const branchesCount = (db.prepare('SELECT COUNT(*) as count FROM branches').get() as { count: number }).count;
    const applicationsCount = (db.prepare('SELECT COUNT(*) as count FROM onboarding_applications').get() as { count: number }).count;
    const transactionsCount = (db.prepare('SELECT COUNT(*) as count FROM transactions').get() as { count: number }).count;

    return {
      customersCount: existingCustomers.count,
      branchesCount,
      applicationsCount,
      transactionsCount,
    };
  }

  // Clear existing data cleanly if force is true
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('DELETE FROM transactions;');
  db.exec('DELETE FROM onboarding_applications;');
  db.exec('DELETE FROM customers;');
  db.exec('DELETE FROM branches;');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('transactions', 'onboarding_applications', 'customers', 'branches');");
  db.exec('PRAGMA foreign_keys = ON;');

  const rng = createPrng(42);

  // 1. Branches Seed (10 branches across 5 regions)
  const branches = [
    { branch_name: 'Metro Central Plaza', city: 'New York', region: 'Northeast' },
    { branch_name: 'Downtown Financial Tower', city: 'Chicago', region: 'Midwest' },
    { branch_name: 'West Bay Commercial Hub', city: 'San Francisco', region: 'West' },
    { branch_name: 'Silicon Corridor Center', city: 'San Jose', region: 'West' },
    { branch_name: 'Sunset Financial District', city: 'Los Angeles', region: 'West' },
    { branch_name: 'Peachtree Business Center', city: 'Atlanta', region: 'Southeast' },
    { branch_name: 'Lone Star Energy Plaza', city: 'Houston', region: 'Southwest' },
    { branch_name: 'Boston Seaport Branch', city: 'Boston', region: 'Northeast' },
    { branch_name: 'Rocky Mountain Banking Hub', city: 'Denver', region: 'West' },
    { branch_name: 'Great Lakes Commerce Center', city: 'Detroit', region: 'Midwest' },
  ];

  const insertBranch = db.prepare(
    'INSERT INTO branches (branch_name, city, region) VALUES (?, ?, ?)'
  );
  for (const b of branches) {
    insertBranch.run(b.branch_name, b.city, b.region);
  }

  // 2. Customers Seed (65 customers across Retail, SME, Corporate)
  const retailNames = [
    'Emma Richardson', 'Liam Patterson', 'Olivia Martinez', 'Noah Campbell',
    'Ava Henderson', 'Elijah Brooks', 'Sophia Zhang', 'Lucas Morales',
    'Mia Washington', 'Mason Jenkins', 'Isabella Flores', 'Oliver Foster',
    'Amelia Simmons', 'Ethan Bryant', 'Harper Alexander', 'James Griffin',
    'Evelyn Hayes', 'Benjamin Myers', 'Charlotte Ford', 'Henry Hamilton',
    'Abigail Graham', 'Alexander Sullivan', 'Emily Wallace', 'Sebastian Cole',
    'Elizabeth West', 'Daniel Jordan', 'Avery Owens', 'Matthew Reynolds',
    'Sofia Fisher', 'Samuel Ellis', 'Ella Harrison', 'David Gibson',
    'Scarlett McDonald', 'Joseph Cruz', 'Victoria Marshall', 'Jackson Ortiz',
    'Grace Gomez', 'Levi Murray', 'Chloe Freeman', 'John Wells'
  ];

  const smeNames = [
    'Apex Logistics LLC', 'Horizon Healthtech Solutions', 'Vanguard Artisan Bakery',
    'BlueSky Digital Media', 'Metro Freight Carriers', 'Summit Eco-Packaging',
    'Crestview Dental Partners', 'Beacon Renewable Systems', 'Ironclad Security Services',
    'Pinnacle Cloud Consulting', 'Timberline Craft Furnishings', 'Urban Roast Coffee Roasters',
    'Cascade Precision Labs', 'Sterling Automotive Fleet', 'Atlas Commercial Cleaning'
  ];

  const corporateNames = [
    'Global Meridian Holdings Inc.', 'Pacifica Energy Conglomerate', 'Vertex Industrial Robotics',
    'OmniCorp BioSciences', 'Titan Aerospace Infrastructure', 'Sentinel Financial Reinsurance',
    'Argus Global Shipping Corp.', 'Hyperion Semiconductor Technologies', 'Valence Chemicals & Materials',
    'Starlight Telecommunications Group'
  ];

  const insertCustomer = db.prepare(
    'INSERT INTO customers (customer_name, customer_segment, created_at) VALUES (?, ?, ?)'
  );

  let customerId = 1;
  const customerList: { id: number; segment: 'Retail' | 'SME' | 'Corporate'; createdAt: string }[] = [];

  // Retail: Dates between Jan 2024 and Oct 2024
  for (const name of retailNames) {
    const month = Math.floor(rng() * 9) + 1; // 1 to 9 (Jan to Sep 2024)
    const day = Math.floor(rng() * 27) + 1;
    const dateStr = `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    insertCustomer.run(name, 'Retail', dateStr);
    customerList.push({ id: customerId++, segment: 'Retail', createdAt: dateStr });
  }

  // SME
  for (const name of smeNames) {
    const month = Math.floor(rng() * 8) + 1;
    const day = Math.floor(rng() * 27) + 1;
    const dateStr = `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    insertCustomer.run(name, 'SME', dateStr);
    customerList.push({ id: customerId++, segment: 'SME', createdAt: dateStr });
  }

  // Corporate
  for (const name of corporateNames) {
    const month = Math.floor(rng() * 6) + 1;
    const day = Math.floor(rng() * 27) + 1;
    const dateStr = `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    insertCustomer.run(name, 'Corporate', dateStr);
    customerList.push({ id: customerId++, segment: 'Corporate', createdAt: dateStr });
  }

  // 3. Onboarding Applications Seed (180 applications)
  const rejectionReasons = [
    'Incomplete KYC Documentation',
    'Credit Score Below Underwriting Threshold',
    'Unverified Beneficial Ownership Structure',
    'High Risk Jurisdictional Exposure',
    'Sanction Screening Ambiguity',
    'Inconsistent Tax Identification Records',
    'Insufficient Debt-Service Coverage'
  ];

  const insertApp = db.prepare(
    'INSERT INTO onboarding_applications (customer_id, branch_id, application_date, status, rejection_reason) VALUES (?, ?, ?, ?, ?)'
  );

  let appCount = 0;
  // Generate 180 applications distributed across May to October 2024
  const months = ['2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10'];
  for (let i = 0; i < 180; i++) {
    const cust = customerList[Math.floor(rng() * customerList.length)];
    const branchId = Math.floor(rng() * branches.length) + 1;
    const month = months[Math.floor(rng() * months.length)];
    const day = Math.floor(rng() * 28) + 1;
    const appDate = `${month}-${String(day).padStart(2, '0')}`;

    // Branch specific rejection variance to make branch rejection rates realistic
    // Branch 2 (Downtown Financial Tower) has higher rejection rate ~36%
    // Branch 5 (Sunset) has ~30%
    // Branch 1 (Metro Central) has ~12%
    let rejectionChance = 0.20;
    if (branchId === 2) rejectionChance = 0.38;
    else if (branchId === 5) rejectionChance = 0.30;
    else if (branchId === 1) rejectionChance = 0.12;
    else if (branchId === 3) rejectionChance = 0.16;

    const roll = rng();
    let status: 'Approved' | 'Rejected' | 'Pending';
    let reason: string | null = null;

    if (roll < rejectionChance) {
      status = 'Rejected';
      reason = rejectionReasons[Math.floor(rng() * rejectionReasons.length)];
    } else if (roll < rejectionChance + 0.12) {
      status = 'Pending';
    } else {
      status = 'Approved';
    }

    insertApp.run(cust.id, branchId, appDate, status, reason);
    appCount++;
  }

  // 4. Transactions Seed (450 transactions)
  const transactionTypes: ('Deposit' | 'Withdrawal' | 'Transfer' | 'Payment')[] = [
    'Deposit', 'Withdrawal', 'Transfer', 'Payment'
  ];

  const insertTx = db.prepare(
    'INSERT INTO transactions (customer_id, branch_id, transaction_date, amount, transaction_type, currency) VALUES (?, ?, ?, ?, ?, ?)'
  );

  let txCount = 0;
  for (let i = 0; i < 450; i++) {
    const cust = customerList[Math.floor(rng() * customerList.length)];
    const branchId = Math.floor(rng() * branches.length) + 1;
    const month = months[Math.floor(rng() * months.length)];
    const day = Math.floor(rng() * 28) + 1;
    const txDate = `${month}-${String(day).padStart(2, '0')}`;
    const txType = transactionTypes[Math.floor(rng() * transactionTypes.length)];

    let amount = 0;
    if (cust.segment === 'Retail') {
      // $50 to $4,500
      amount = Math.round((rng() * 4450 + 50) * 100) / 100;
    } else if (cust.segment === 'SME') {
      // $2,500 to $85,000
      amount = Math.round((rng() * 82500 + 2500) * 100) / 100;
    } else {
      // Corporate: $50,000 to $750,000
      amount = Math.round((rng() * 700000 + 50000) * 100) / 100;
    }

    insertTx.run(cust.id, branchId, txDate, amount, txType, 'USD');
    txCount++;
  }

  return {
    customersCount: customerList.length,
    branchesCount: branches.length,
    applicationsCount: appCount,
    transactionsCount: txCount,
  };
}
