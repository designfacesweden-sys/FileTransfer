import * as server from '../entries/pages/supabase-demo/_page.server.ts.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/supabase-demo/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/supabase-demo/+page.server.ts";
export const imports = ["_app/immutable/nodes/8.DzID82Qo.js","_app/immutable/chunks/B09JKvsk.js","_app/immutable/chunks/CsaauQz1.js"];
export const stylesheets = [];
export const fonts = [];
