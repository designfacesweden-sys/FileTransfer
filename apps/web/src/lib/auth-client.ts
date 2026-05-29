import { goto } from '$app/navigation';
import { invalidateAll } from '$app/navigation';
import { signIn, signOut } from '@auth/sveltekit/client';
import { PUBLIC_API_URL, PUBLIC_CLIENT_AUTH } from '$env/static/public';
import { setClientUser, type ClientUser } from '$lib/stores/session';
import { translateApiError } from '$lib/i18n/api-errors';

const apiBase = PUBLIC_API_URL || 'http://localhost:3001';
const useClientAuth = PUBLIC_CLIENT_AUTH === 'true';

export async function loginWithCredentials(
	email: string,
	password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
	if (useClientAuth) {
		try {
			const res = await fetch(`${apiBase}/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email.trim(), password })
			});

			const contentType = res.headers.get('content-type') ?? '';
			if (!contentType.includes('application/json')) {
				return {
					ok: false,
					error:
						'API svarade med HTML i stället för JSON. Kontrollera PUBLIC_API_URL (Render API-URL, inte keira.se).'
				};
			}

			const body = (await res.json()) as ClientUser | { error?: string; message?: string };
			if (!res.ok) {
				return {
					ok: false,
					error: translateApiError(
						('error' in body && body.error) ||
							('message' in body && body.message) ||
							'Ogiltig e-post eller lösenord'
					)
				};
			}

			setClientUser(body as ClientUser);
			return { ok: true };
		} catch {
			return { ok: false, error: 'Kunde inte nå API-servern. Kontrollera PUBLIC_API_URL.' };
		}
	}

	const result = await signIn('credentials', {
		email: email.trim(),
		password,
		redirect: false
	});

	if (result?.error) {
		return { ok: false, error: 'Ogiltig e-post eller lösenord' };
	}

	await invalidateAll();
	return { ok: true };
}

export async function logoutClient() {
	setClientUser(null);
	await goto('/');
}

export function logout() {
	if (useClientAuth) {
		void logoutClient();
		return;
	}
	signOut({ callbackUrl: '/' });
}
