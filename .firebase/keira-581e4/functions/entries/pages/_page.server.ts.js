//#region src/routes/+page.server.ts
var load = async ({ parent }) => {
	const { session } = await parent();
	return { session };
};
//#endregion
export { load };
