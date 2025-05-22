import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

import { CONFIG } from './config';

const client = postgres(CONFIG.DATABASE_URL, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Idle connection timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
  max_lifetime: 60 * 30, // Maximum lifetime of a connection in seconds (30 minutes)
  ssl: 'require'
});

export const db = drizzle(client, { schema });