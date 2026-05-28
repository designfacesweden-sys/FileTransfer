import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { config } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (config.databaseDriver === 'memory') {
  console.log('In-memory database initializes on API startup. No migration needed.');
  process.exit(0);
}

const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
const pool = new pg.Pool({ connectionString: config.databaseUrl });

await pool.query(sql);
await pool.end();
console.log('Database migrated successfully.');
