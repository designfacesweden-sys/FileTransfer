import { H as escape_html, V as attr, s as head } from "../../../chunks/dev.js";
//#region src/routes/support/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let name = "";
		let email = "";
		let category = "general";
		let subject = "";
		let message = "";
		let sending = false;
		head("1j5tn20", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Support — Keira</title>`);
			});
		});
		$$renderer.push(`<section class="support svelte-1j5tn20"><div class="support__panel glass svelte-1j5tn20"><p class="support__kicker svelte-1j5tn20">Hjälp</p> <h1 class="support__title svelte-1j5tn20">Support</h1> <p class="support__sub svelte-1j5tn20">Skicka ett meddelande till oss — vi svarar via e-post. Förfrågningar sparas hos CERCINO.</p> `);
		{
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<form class="support__form svelte-1j5tn20"><label class="glass-label">Namn <input${attr("value", name)} required="" maxlength="120" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">E-post <input${attr("value", email)} type="email" required="" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">Kategori `);
			$$renderer.select({
				value: category,
				class: "glass-input mt-1.5"
			}, ($$renderer) => {
				$$renderer.option({ value: "general" }, ($$renderer) => {
					$$renderer.push(`Allmänt`);
				});
				$$renderer.option({ value: "billing" }, ($$renderer) => {
					$$renderer.push(`Fakturering`);
				});
				$$renderer.option({ value: "technical" }, ($$renderer) => {
					$$renderer.push(`Tekniskt`);
				});
				$$renderer.option({ value: "enterprise" }, ($$renderer) => {
					$$renderer.push(`Enterprise`);
				});
			});
			$$renderer.push(`</label> <label class="glass-label mt-3">Ämne <input${attr("value", subject)} required="" maxlength="200" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">Meddelande <textarea required="" minlength="10" maxlength="5000" rows="5" class="glass-input mt-1.5 resize-y" placeholder="Beskriv ditt ärende…">`);
			const $$body = escape_html(message);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea></label> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <button type="submit"${attr("disabled", sending, true)} class="btn-primary support__submit svelte-1j5tn20">${escape_html("Skicka förfrågan")}</button></form>`);
		}
		$$renderer.push(`<!--]--> <a href="/" class="support__back svelte-1j5tn20">← Tillbaka till startsidan</a></div></section>`);
	});
}
//#endregion
export { _page as default };
