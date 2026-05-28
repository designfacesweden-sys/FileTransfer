/**
 * Supabase direct host (db.*.supabase.co) is often IPv6-only.
 * Node on Windows frequently fails with ENOTFOUND — use the session pooler instead.
 */
export function resolveDatabaseUrl(url: string): string {
	if (process.env.SUPABASE_USE_DIRECT === 'true') {
		return url;
	}

	const match = url.match(
		/^postgresql:\/\/([^:]+):([^@]+)@db\.([a-z0-9]+)\.supabase\.co:(\d+)\/(.+)$/i
	);
	if (!match) {
		return url;
	}

	const [, , password, projectRef, , database] = match;
	const region = process.env.SUPABASE_REGION;
	if (!region) {
		console.warn(
			'[db] Supabase direct URL detected (IPv6-only on many networks). ' +
				'Set SUPABASE_REGION in apps/api/.env (see Supabase → Project Settings → General), ' +
				'or paste the Session pooler URI from Database → Connection string.'
		);
		return url;
	}

	const poolerUser = `postgres.${projectRef}`;
	const encodedPassword = encodeURIComponent(password);
	// Newer Supabase projects use aws-1-* poolers; aws-0-* returns "tenant/user not found".
	const poolerPrefix = process.env.SUPABASE_POOLER_PREFIX ?? 'aws-1';
	const poolerHost = `${poolerPrefix}-${region}.pooler.supabase.com`;
	const poolerUrl = `postgresql://${poolerUser}:${encodedPassword}@${poolerHost}:5432/${database}`;

	console.log(`[db] Supabase session pooler: ${poolerHost}`);
	return poolerUrl;
}

export function isSupabaseUrl(url: string): boolean {
	return url.includes('supabase.co');
}
