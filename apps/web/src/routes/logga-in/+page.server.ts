import { isFirebaseStaticBuild } from '$lib/firebase-static';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (isFirebaseStaticBuild) {
		return { redirectTo: '/' };
	}
	const session = await locals.auth();
	const rawRedirect = url.searchParams.get('redirectTo') || '/';
	const redirectTo =
		rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/';
	if (session?.user) {
		throw redirect(303, redirectTo);
	}
	return { redirectTo };
};
