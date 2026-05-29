#!/usr/bin/env node
/**
 * Deploy Keira web to Firebase Hosting on Spark (free) — static files only, no Blaze.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envProduction = resolve(root, 'apps/web/.env.production');

function loadEnvFile(path) {
	if (!existsSync(path)) return;
	for (const line of readFileSync(path, 'utf8').split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const eq = trimmed.indexOf('=');
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		const value = trimmed.slice(eq + 1).trim();
		if (key && process.env[key] === undefined) {
			process.env[key] = value;
		}
	}
}

function run(cmd, args, env = {}) {
	const result = spawnSync(cmd, args, {
		cwd: root,
		env: { ...process.env, ...env },
		stdio: 'inherit',
		shell: true
	});
	if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);
}

loadEnvFile(envProduction);

const apiUrl = process.env.PUBLIC_API_URL ?? '';
const clientAuth = process.env.PUBLIC_CLIENT_AUTH ?? '';

if (!apiUrl || apiUrl.includes('localhost') || apiUrl.includes('YOUR-SERVICE')) {
	console.error(
		'\nMissing PUBLIC_API_URL for production.\n' +
			'Copy apps/web/.env.production.example → apps/web/.env.production\n' +
			'Set PUBLIC_API_URL=https://keira-api.onrender.com (your Render URL, not keira.se)\n'
	);
	process.exit(1);
}

if (clientAuth !== 'true') {
	console.error(
		'\nSet PUBLIC_CLIENT_AUTH=true in apps/web/.env.production for Firebase static hosting.\n'
	);
	process.exit(1);
}

console.log('Building static site for Firebase Spark (no Cloud Functions)…');
console.log(`  PUBLIC_API_URL=${apiUrl}`);
console.log(`  PUBLIC_CLIENT_AUTH=${clientAuth}`);

run('npm', ['ci']);
run('npm', ['run', 'build:firebase', '-w', 'web'], {
	FIREBASE_STATIC: '1',
	PUBLIC_API_URL: apiUrl,
	PUBLIC_CLIENT_AUTH: clientAuth,
	PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL ?? '',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
	AUTH_SECRET: process.env.AUTH_SECRET ?? 'firebase-static-build',
	AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? 'true'
});

console.log('Deploying to Firebase Hosting…');
run('firebase', ['deploy', '--only', 'hosting']);

console.log('\nDone. Site: https://keira.se (and https://keira-581e4.web.app)');
console.log(
	'Note: Spark static hosting cannot run server auth. Login uses client + Render API only.'
);
