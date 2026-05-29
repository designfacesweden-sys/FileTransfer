import { isFirebaseStaticBuild } from '$lib/firebase-static';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (isFirebaseStaticBuild) {
		return {};
	}
	const session = await locals.auth();
	if (session?.user) {
		throw redirect(303, '/');
	}
	return {};
};
