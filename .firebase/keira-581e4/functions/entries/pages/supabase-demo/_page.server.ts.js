import { n as PUBLIC_SUPABASE_PUBLISHABLE_KEY, r as PUBLIC_SUPABASE_URL } from "../../../chunks/public.js";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
var supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, { realtime: typeof WebSocket === "undefined" ? { transport: ws } : void 0 });
//#endregion
//#region src/routes/supabase-demo/+page.server.ts
var load = async () => {
	const { data, error } = await supabase.from("countries").select();
	return {
		countries: data ?? [],
		error: error?.message ?? null
	};
};
//#endregion
export { load };
