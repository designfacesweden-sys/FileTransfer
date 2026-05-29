import type { Handle } from '@sveltejs/kit';
import { createClient } from './server';

export const updateSupabaseSession: Handle = async ({ event, resolve }) => {
	const supabase = createClient(event);

	// Refresh session/cookies on each request when a user is logged in.
	await supabase.auth.getUser();

	return resolve(event);
};
