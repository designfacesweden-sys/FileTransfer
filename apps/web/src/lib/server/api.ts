import { PUBLIC_API_URL } from '$env/static/public';
import type { AuthUser, PlanId } from '@filetransfer/shared';

export const apiBase = PUBLIC_API_URL || 'http://localhost:3001';

const PLAN_IDS: PlanId[] = ['free', 'standard', 'enterprise'];

export function normalizePlan(plan: string | undefined | null): PlanId {
	if (plan && PLAN_IDS.includes(plan as PlanId)) return plan as PlanId;
	return 'free';
}

export function normalizeAuthUser(raw: AuthUser): AuthUser {
	return {
		id: raw.id,
		email: raw.email,
		name: raw.name,
		plan: normalizePlan(raw.plan)
	};
}

export async function fetchAuthUser(
	fetchFn: typeof fetch,
	userId: string
): Promise<{ ok: true; user: AuthUser } | { ok: false; status: number }> {
	const res = await fetchFn(`${apiBase}/api/auth/me/${userId}`);
	if (!res.ok) return { ok: false, status: res.status };
	const user = normalizeAuthUser((await res.json()) as AuthUser);
	return { ok: true, user };
}

export async function patchAuthProfile(
	fetchFn: typeof fetch,
	userId: string,
	name: string
): Promise<{ ok: true; user: AuthUser } | { ok: false; status: number; error: string }> {
	const res = await fetchFn(`${apiBase}/api/auth/profile/${userId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name })
	});

	if (!res.ok) {
		const body = (await res.json().catch(() => ({}))) as { error?: string };
		return {
			ok: false,
			status: res.status,
			error: body.error ?? 'Kunde inte spara profilen.'
		};
	}

	const user = normalizeAuthUser((await res.json()) as AuthUser);
	return { ok: true, user };
}
