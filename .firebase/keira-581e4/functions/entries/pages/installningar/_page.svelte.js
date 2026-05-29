import { H as escape_html, V as attr, a as derived, o as ensure_array_like, s as head } from "../../../chunks/dev.js";
import "../../../chunks/client.js";
import { n as PLAN_LABELS, t as PLANS } from "../../../chunks/src.js";
import "../../../chunks/navigation.js";
//#region src/routes/installningar/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let savingProfile = false;
		const user = derived(() => form?.user ?? data.user);
		let name = "";
		const planId = derived(() => user().plan);
		const planConfig = derived(() => PLANS[planId()]);
		const planLabel = derived(() => PLAN_LABELS[planId()]);
		function userInitial() {
			return (user().name ?? user().email ?? "?").charAt(0).toUpperCase();
		}
		function gb(bytes) {
			return `${Math.round(bytes / 1024 ** 3)} GB`;
		}
		const planFeatures = derived(() => {
			const features = [`Upp till ${gb(planConfig().maxBytes)} per överföring`, planId() === "free" ? "Lagring i 1 eller 2 dagar" : "Lagring i 5 eller 7 dagar"];
			if (planConfig().passwordProtection) features.push("Lösenordsskyddade länkar");
			if (planConfig().analytics) features.push("Nedladdningsstatistik");
			if (planConfig().customBranding) features.push("Anpassad branding");
			return features;
		});
		head("167wrxx", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Inställningar — Keira</title>`);
			});
		});
		$$renderer.push(`<section class="settings-page svelte-167wrxx"><div class="settings-page__panel glass svelte-167wrxx"><header class="settings-page__header svelte-167wrxx"><p class="settings-page__kicker svelte-167wrxx">Konto</p> <h1 class="settings-page__title svelte-167wrxx">Inställningar</h1></header> <section class="settings-section svelte-167wrxx" aria-labelledby="profile-heading"><h2 id="profile-heading" class="settings-section__title svelte-167wrxx">Profil</h2> <div class="settings-profile svelte-167wrxx"><div class="settings-profile__avatar svelte-167wrxx" aria-hidden="true"><span>${escape_html(userInitial())}</span></div> <form class="settings-profile__form svelte-167wrxx" method="POST" action="?/updateProfile"><label class="glass-label">Namn <input${attr("value", name)} type="text" name="name" required="" maxlength="120" autocomplete="name" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">E-post <input type="email"${attr("value", user().email)} disabled="" class="glass-input mt-1.5 settings-profile__email svelte-167wrxx"/></label> `);
		if (form?.profileError) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="settings-section__error svelte-167wrxx">${escape_html(form.profileError)}</p>`);
		} else if (form?.profileSuccess) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="settings-section__success svelte-167wrxx">Profilen sparades.</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button type="submit" class="btn-primary settings-section__btn svelte-167wrxx"${attr("disabled", savingProfile, true)}>${escape_html("Spara profil")}</button></form></div></section> <section class="settings-section svelte-167wrxx" aria-labelledby="subscription-heading"><h2 id="subscription-heading" class="settings-section__title svelte-167wrxx">Prenumeration</h2> <div class="settings-subscription glass svelte-167wrxx"><div class="settings-subscription__head svelte-167wrxx"><div><p class="settings-subscription__label svelte-167wrxx">Nuvarande plan</p> <p class="settings-subscription__plan svelte-167wrxx">${escape_html(planLabel())}</p></div> <span class="settings-subscription__badge svelte-167wrxx">${escape_html(planLabel())}</span></div> <ul class="settings-subscription__features svelte-167wrxx"><!--[-->`);
		const each_array = ensure_array_like(planFeatures());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let feature = each_array[$$index];
			$$renderer.push(`<li class="svelte-167wrxx">${escape_html(feature)}</li>`);
		}
		$$renderer.push(`<!--]--></ul> `);
		if (planId() === "free") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a href="/pricing" class="settings-subscription__upgrade svelte-167wrxx"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="svelte-167wrxx"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"></path></svg> Uppgradera</a>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<a href="/pricing" class="settings-subscription__link svelte-167wrxx">Hantera prenumeration →</a>`);
		}
		$$renderer.push(`<!--]--></div></section> <a href="/" class="settings-page__back svelte-167wrxx">← Tillbaka</a></div></section>`);
	});
}
//#endregion
export { _page as default };
