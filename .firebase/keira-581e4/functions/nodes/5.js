import * as server from '../entries/pages/logga-in/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/logga-in/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/logga-in/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.CJ5JLiZh.js","_app/immutable/chunks/B09JKvsk.js","_app/immutable/chunks/Brf1tB8d.js","_app/immutable/chunks/Dxw2rwp4.js","_app/immutable/chunks/C8gyL8k2.js","_app/immutable/chunks/CsaauQz1.js"];
export const stylesheets = ["_app/immutable/assets/5.Br7XKkRQ.css"];
export const fonts = [];
