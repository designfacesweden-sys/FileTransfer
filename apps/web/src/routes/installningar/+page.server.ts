import { isFirebaseStaticBuild } from '$lib/firebase-static';
import { redirect } from '@sveltejs/kit';
import { fetchAuthUser } from '$lib/server/api';
import type { AuthUser, PlanId } from '@filetransfer/shared';
import type { PageServerLoad } from './$types';

function userFromSession(session: {
	user: { id: string; email?: string | null; name?: string | null; plan?: PlanId };
}): AuthUser {
	return {
		id: session.user.id,
		email: session.user.email ?? '',
		name: session.user.name ?? null,
		plan: session.user.plan ?? 'free'
	};
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (isFirebaseStaticBuild) {
		return {};
	}

	const session = await locals.auth();
	if (!session?.user?.id) {
		throw redirect(303, '/logga-in?redirectTo=/installningar');
	}

	const result = await fetchAuthUser(fetch, session.user.id);
	if (result.ok) {
		return { session, user: result.user };
	}

	if (result.status === 404) {
		throw redirect(303, '/logga-in?redirectTo=/installningar');
	}

	return { session, user: userFromSession(session) };
};
