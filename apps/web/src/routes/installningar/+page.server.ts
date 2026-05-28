import { fail, redirect } from '@sveltejs/kit';
import { fetchAuthUser, patchAuthProfile } from '$lib/server/api';
import type { AuthUser, PlanId } from '@filetransfer/shared';
import type { Actions, PageServerLoad } from './$types';

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

export const actions: Actions = {
	updateProfile: async ({ request, locals, fetch }) => {
		const session = await locals.auth();
		if (!session?.user?.id) {
			throw redirect(303, '/logga-in?redirectTo=/installningar');
		}

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		if (!name) {
			return fail(400, { profileError: 'Ange ett namn.' });
		}

		const result = await patchAuthProfile(fetch, session.user.id, name);
		if (!result.ok) {
			return fail(result.status, { profileError: result.error });
		}

		return { profileSuccess: true, user: result.user };
	}
};
