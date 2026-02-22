import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

const dbUrl = process.env.DATABASE_URL ?? '';

// Strip sslmode from connection string — we configure SSL via pool options
// to avoid pg's strict verify-full interpretation of sslmode=require
const connectionString = dbUrl.replace(/[?&]sslmode=[^&]*/g, '');
const needsSsl = dbUrl.includes('sslmode=') || dbUrl.includes('.rds.amazonaws.com');

const pool = new pg.Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
export { pool };
export * from './schema.js';
