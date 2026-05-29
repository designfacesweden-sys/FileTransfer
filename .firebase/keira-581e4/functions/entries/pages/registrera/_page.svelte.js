import { H as escape_html, V as attr, s as head } from "../../../chunks/dev.js";
import "../../../chunks/auth-client.js";
import "../../../chunks/navigation.js";
//#region src/routes/registrera/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let name = "";
		let email = "";
		let password = "";
		let confirmPassword = "";
		let loading = false;
		head("125tgzr", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Registrera dig — Keira</title>`);
			});
		});
		$$renderer.push(`<section class="auth-page svelte-125tgzr"><div class="auth-page__panel glass svelte-125tgzr"><p class="auth-page__kicker svelte-125tgzr">Konto</p> <h1 class="auth-page__title svelte-125tgzr">Registrera dig</h1> <p class="auth-page__sub svelte-125tgzr">Skapa ett gratis Keira-konto.</p> <form class="auth-page__form svelte-125tgzr"><label class="glass-label">Namn <span class="auth-page__optional svelte-125tgzr">(valfritt)</span> <input${attr("value", name)} maxlength="120" autocomplete="name" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">E-post <input${attr("value", email)} type="email" required="" autocomplete="email" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">Lösenord <input${attr("value", password)} type="password" required="" minlength="8" autocomplete="new-password" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">Bekräfta lösenord <input${attr("value", confirmPassword)} type="password" required="" minlength="8" autocomplete="new-password" class="glass-input mt-1.5"/></label> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button type="submit"${attr("disabled", loading, true)} class="btn-primary auth-page__submit svelte-125tgzr">${escape_html("Skapa konto")}</button></form> <p class="auth-page__switch svelte-125tgzr">Har du redan ett konto? <a href="/logga-in" class="svelte-125tgzr">Logga in</a></p> <a href="/" class="auth-page__back svelte-125tgzr">← Tillbaka</a></div></section>`);
	});
}
//#endregion
export { _page as default };
