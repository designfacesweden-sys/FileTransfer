import { isFirebaseStaticBuild } from '$lib/firebase-static';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (isFirebaseStaticBuild) {
		return { session: null };
	}
	const session = await locals.auth();
	return { session };
};
