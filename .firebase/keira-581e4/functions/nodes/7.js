import * as server from '../entries/pages/registrera/_page.server.ts.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/registrera/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/registrera/+page.server.ts";
export const imports = ["_app/immutable/nodes/7.DW0v18u9.js","_app/immutable/chunks/B09JKvsk.js","_app/immutable/chunks/Brf1tB8d.js","_app/immutable/chunks/D0jhHvNC.js","_app/immutable/chunks/Dxw2rwp4.js","_app/immutable/chunks/C8gyL8k2.js","_app/immutable/chunks/CsaauQz1.js"];
export const stylesheets = ["_app/immutable/assets/7.DB-JuY6i.css"];
export const fonts = [];
