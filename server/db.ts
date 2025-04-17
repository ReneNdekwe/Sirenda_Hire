import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

import { CONFIG } from './config';

const client = postgres(CONFIG.DATABASE_URL);
export const db = drizzle(client, { schema });