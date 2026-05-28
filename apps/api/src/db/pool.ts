import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { newDb } from 'pg-mem';
import { config } from '../config.js';
import { isSupabaseUrl } from './connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function createMemoryPool(): pg.Pool {
  const db = newDb();

  db.public.registerFunction({
    name: 'gen_random_uuid',
    returns: 'uuid' as never,
    impure: true,
    implementation: () => randomUUID()
  });

  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  const sanitizedSchema = schema
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const statements = sanitizedSchema
    .split(';')
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 0 &&
        !s.toUpperCase().startsWith('CREATE EXTENSION') &&
        !s.toUpperCase().includes('ENABLE ROW LEVEL SECURITY')
    );

  for (const statement of statements) {
    db.public.none(`${statement};`);
  }

  const { Pool } = db.adapters.createPg();
  console.log('Using in-memory database (dev). Set DATABASE_DRIVER=postgres in apps/api/.env for Supabase.');
  return new Pool();
}

export function createPool(): pg.Pool {
  if (config.databaseDriver === 'memory') {
    return createMemoryPool();
  }

  const connectionString = config.databaseUrl;
  return new pg.Pool({
    connectionString,
    ssl: isSupabaseUrl(connectionString) ? { rejectUnauthorized: false } : undefined
  });
}

