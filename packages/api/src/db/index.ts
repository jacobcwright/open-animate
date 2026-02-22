import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=')
    ? { rejectUnauthorized: false }
    : undefined,
});

export const db = drizzle(pool, { schema });
export { pool };
export * from './schema.js';
