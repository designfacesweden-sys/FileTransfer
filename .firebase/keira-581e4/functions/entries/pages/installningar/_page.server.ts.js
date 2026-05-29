import { n as fetchAuthUser, r as patchAuthProfile } from "../../../chunks/api2.js";
import { fail, redirect } from "@sveltejs/kit";
//#region src/routes/installningar/+page.server.ts
function userFromSession(session) {
	return {
		id: session.user.id,
		email: session.user.email ?? "",
		name: session.user.name ?? null,
		plan: session.user.plan ?? "free"
	};
}
var load = async ({ locals, fetch }) => {
	const session = await locals.auth();
	if (!session?.user?.id) throw redirect(303, "/logga-in?redirectTo=/installningar");
	const result = await fetchAuthUser(fetch, session.user.id);
	if (result.ok) return {
		session,
		user: result.user
	};
	if (result.status === 404) throw redirect(303, "/logga-in?redirectTo=/installningar");
	return {
		session,
		user: userFromSession(session)
	};
};
var actions = { updateProfile: async ({ request, locals, fetch }) => {
	const session = await locals.auth();
	if (!session?.user?.id) throw redirect(303, "/logga-in?redirectTo=/installningar");
	const formData = await request.formData();
	const name = String(formData.get("name") ?? "").trim();
	if (!name) return fail(400, { profileError: "Ange ett namn." });
	const result = await patchAuthProfile(fetch, session.user.id, name);
	if (!result.ok) return fail(result.status, { profileError: result.error });
	return {
		profileSuccess: true,
		user: result.user
	};
} };
//#endregion
export { actions, load };
