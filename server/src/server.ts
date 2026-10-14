import { createApp } from './app.js';
import { config } from './config/env.js';
import { getDatabase } from './db/connection.js';
import { seedDatabase } from './db/seedData.js';

function start() {
  // Ensure database schema and default seeds exist
  const db = getDatabase();
  seedDatabase(db, { force: false });

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`🚀 Conversational Banking Analytics API listening on port ${config.port}`);
    console.log(`   - Environment: ${config.nodeEnv}`);
    console.log(`   - Database: ${config.databasePath}`);
    console.log(`   - Health check: http://localhost:${config.port}/api/health`);
    console.log(`   - Chat endpoint: http://localhost:${config.port}/api/chat`);
  });
}

start();
