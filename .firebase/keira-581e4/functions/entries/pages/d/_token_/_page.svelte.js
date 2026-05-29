import "../../../../chunks/environment.js";
import { a as derived, d as unsubscribe_stores, l as store_get } from "../../../../chunks/dev.js";
import { t as page } from "../../../../chunks/stores.js";
import "../../../../chunks/api.js";
//#region src/routes/d/[token]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let remainingSeconds = 0;
		derived(() => store_get($$store_subs ??= {}, "$page", page).params.token ?? "");
		derived(() => formatCountdown(remainingSeconds));
		function formatCountdown(seconds) {
			const total = Math.max(0, Math.ceil(seconds));
			const days = Math.floor(total / 86400);
			const hours = Math.floor(total % 86400 / 3600);
			const minutes = Math.floor(total % 3600 / 60);
			const secs = total % 60;
			if (days > 0) return `${days} d ${hours} tim ${minutes} min`;
			if (hours > 0) return `${hours} tim ${minutes} min ${secs} s`;
			return `${minutes}:${secs.toString().padStart(2, "0")}`;
		}
		$$renderer.push(`<section class="download svelte-5gcoa9">`);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<p class="download__loading svelte-5gcoa9">Laddar överföring…</p>`);
		$$renderer.push(`<!--]--></section>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
