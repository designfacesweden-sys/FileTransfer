import { redirect } from "@sveltejs/kit";
//#region src/routes/registrera/+page.server.ts
var load = async ({ locals }) => {
	if ((await locals.auth())?.user) throw redirect(303, "/");
	return {};
};
//#endregion
export { load };
