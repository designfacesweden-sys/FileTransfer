import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.j5HdPxtJ.js","_app/immutable/chunks/B09JKvsk.js","_app/immutable/chunks/D0jhHvNC.js","_app/immutable/chunks/Dxw2rwp4.js","_app/immutable/chunks/Brf1tB8d.js","_app/immutable/chunks/C8gyL8k2.js","_app/immutable/chunks/DgC0k56T.js","_app/immutable/chunks/CsaauQz1.js","_app/immutable/chunks/Cc9sqcvF.js"];
export const stylesheets = ["_app/immutable/assets/0.DB1uzhaF.css"];
export const fonts = [];
