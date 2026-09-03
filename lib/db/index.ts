import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=verify-full");

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Use postgres-js driver for full transactional support (including row-level locks).
// Better Auth still uses drizzleAdapter(db, { provider: 'pg' }) which works with any pg-compatible driver.
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  prepare: false,
});

export const db = drizzle(client, { schema });

export * from './schema';
export { client as sqlClient };