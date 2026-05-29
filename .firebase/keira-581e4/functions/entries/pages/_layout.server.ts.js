//#region src/routes/+layout.server.ts
var load = async ({ locals }) => {
	return { session: await locals.auth() };
};
//#endregion
export { load };
