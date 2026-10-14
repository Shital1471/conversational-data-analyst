import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databasePath: process.env.DATABASE_URL || path.resolve(process.cwd(), 'banking.db'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
