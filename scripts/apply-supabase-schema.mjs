#!/usr/bin/env node
/**
 * Applies apps/api/src/db/schema.sql to a PostgreSQL database (Supabase or local).
 *
 * Usage:
 *   SUPABASE_DB_URL="postgresql://postgres.[ref]:[PASSWORD]@..." npm run db:supabase
 *
 * Or set DATABASE_URL in apps/api/.env and run with that file loaded.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { config as loadEnv } from 'dotenv';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiEnv = resolve(root, 'apps/api/.env');
const rootEnv = resolve(root, '.env');

if (existsSync(apiEnv)) loadEnv({ path: apiEnv });
if (existsSync(rootEnv)) loadEnv({ path: rootEnv });

const connectionString =
	process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL ?? '';

if (!connectionString) {
	console.error(
		'Missing database URL. Set SUPABASE_DB_URL or DATABASE_URL (e.g. in apps/api/.env).'
	);
	console.error('');
	console.error('Supabase: Project Settings → Database → Connection string → URI');
	console.error('Use the postgres user password from the same page.');
	process.exit(1);
}

const schemaPath = resolve(root, 'apps/api/src/db/schema.sql');
const sql = readFileSync(schemaPath, 'utf8');

const pool = new pg.Pool({
	connectionString,
	ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined
});

try {
	await pool.query(sql);
	console.log('Keira schema applied successfully.');
	console.log('Tables: transfers, files, users, support_requests');
} catch (err) {
	console.error('Migration failed:', err);
	process.exit(1);
} finally {
	await pool.end();
}
