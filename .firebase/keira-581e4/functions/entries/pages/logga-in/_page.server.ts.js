import { redirect } from "@sveltejs/kit";
//#region src/routes/logga-in/+page.server.ts
var load = async ({ locals, url }) => {
	const session = await locals.auth();
	const rawRedirect = url.searchParams.get("redirectTo") || "/";
	const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";
	if (session?.user) throw redirect(303, redirectTo);
	return { redirectTo };
};
//#endregion
export { load };
