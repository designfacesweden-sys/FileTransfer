import { invalidateAll } from '$app/navigation';
import { signIn } from '@auth/sveltekit/client';

export async function loginWithCredentials(
	email: string,
	password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
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
