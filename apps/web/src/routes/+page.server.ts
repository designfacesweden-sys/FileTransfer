import { isFirebaseStaticBuild } from '$lib/firebase-static';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	if (isFirebaseStaticBuild) {
		return { session: null };
	}
	const { session } = await parent();
	return { session };
};
