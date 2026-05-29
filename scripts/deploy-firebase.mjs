#!/usr/bin/env node
/**
 * Deploy Keira web to Firebase Hosting on Spark (free) — static files only, no Blaze.
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, args, env = {}) {
	const result = spawnSync(cmd, args, {
		cwd: root,
		env: { ...process.env, ...env },
		stdio: 'inherit',
		shell: true
	});
	if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);
}

console.log('Building static site for Firebase Spark (no Cloud Functions)…');
run('npm', ['ci']);
run('npm', ['run', 'build:firebase', '-w', 'web']);

console.log('Deploying to Firebase Hosting…');
run('firebase', ['deploy', '--only', 'hosting']);

console.log('\nDone. Site: https://keira-581e4.web.app');
console.log(
	'Note: Spark static hosting cannot run server auth. Login uses client + Render API only.'
);
