import { H as escape_html, V as attr, s as head } from "../../../chunks/dev.js";
import "../../../chunks/auth-client.js";
import "../../../chunks/navigation.js";
//#region src/routes/logga-in/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let email = "";
		let password = "";
		let loading = false;
		head("h9wa6v", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Logga in — Keira</title>`);
			});
		});
		$$renderer.push(`<section class="auth-page svelte-h9wa6v"><div class="auth-page__panel glass svelte-h9wa6v"><p class="auth-page__kicker svelte-h9wa6v">Konto</p> <h1 class="auth-page__title svelte-h9wa6v">Logga in</h1> <p class="auth-page__sub svelte-h9wa6v">Välkommen tillbaka till Keira.</p> <form class="auth-page__form svelte-h9wa6v"><label class="glass-label">E-post <input${attr("value", email)} type="email" required="" autocomplete="email" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">Lösenord <input${attr("value", password)} type="password" required="" autocomplete="current-password" minlength="8" class="glass-input mt-1.5"/></label> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button type="submit"${attr("disabled", loading, true)} class="btn-primary auth-page__submit svelte-h9wa6v">${escape_html("Logga in")}</button></form> <p class="auth-page__switch svelte-h9wa6v">Har du inget konto? <a href="/registrera" class="svelte-h9wa6v">Registrera dig</a></p> <a href="/" class="auth-page__back svelte-h9wa6v">← Tillbaka</a></div></section>`);
	});
}
//#endregion
export { _page as default };
