import { getDatabase, closeDatabase } from './connection.js';
import { seedDatabase } from './seedData.js';

function runSeed() {
  console.log('🔄 Initializing SQLite database and executing seed process...');
  const db = getDatabase();

  try {
    const result = seedDatabase(db, { force: true });
    console.log('✅ Seed completed successfully:');
    console.log(`   - Customers:    ${result.customersCount}`);
    console.log(`   - Branches:     ${result.branchesCount}`);
    console.log(`   - Applications: ${result.applicationsCount}`);
    console.log(`   - Transactions: ${result.transactionsCount}`);
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

runSeed();
