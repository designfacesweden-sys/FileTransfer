import * as server from '../entries/pages/installningar/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/installningar/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/installningar/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.Cty47eMn.js","_app/immutable/chunks/B09JKvsk.js","_app/immutable/chunks/Brf1tB8d.js","_app/immutable/chunks/C8gyL8k2.js","_app/immutable/chunks/CsaauQz1.js","_app/immutable/chunks/Cc9sqcvF.js"];
export const stylesheets = ["_app/immutable/assets/4.DVxxbfhn.css"];
export const fonts = [];
