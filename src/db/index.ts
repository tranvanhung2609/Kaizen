import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create a Postgres client for Drizzle
// Using connection pooling helper config (prepare: false) for compatibility with Supabase
const client = postgres(process.env.DATABASE_URL_V1!, {
  prepare: false,
});

export const db = drizzle(client, { schema });
