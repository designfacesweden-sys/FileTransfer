import { H as escape_html, V as attr, a as derived, n as attr_class, o as ensure_array_like, s as head } from "../../../chunks/dev.js";
import { t as PLANS } from "../../../chunks/src.js";
//#region src/routes/pricing/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const free = PLANS.free;
		const standardPlan = PLANS.standard;
		const enterprise = PLANS.enterprise;
		const standardFeatures = [
			`Upp till ${Math.round(standardPlan.maxBytes / 1024 ** 3)} GB per överföring`,
			"Lagring i 5 eller 7 dagar",
			"Lösenordsskyddade länkar",
			"Nedladdningsstatistik"
		];
		let billingPeriod = "monthly";
		const billingOptions = [
			{
				id: "once",
				label: "Engångsbetalning"
			},
			{
				id: "monthly",
				label: "Månadsvis"
			},
			{
				id: "yearly",
				label: "Årsvid"
			}
		];
		function standardPricing(period) {
			switch (period) {
				case "once": return {
					price: "249 kr",
					suffix: "",
					note: "Engångsbetalning"
				};
				case "yearly": return {
					price: "79 kr",
					suffix: "/mån",
					note: "Faktureras årsvis"
				};
				default: return {
					price: "99 kr",
					suffix: "/mån",
					note: "Faktureras månadsvis"
				};
			}
		}
		function gb(bytes) {
			return `${Math.round(bytes / 1024 ** 3)} GB`;
		}
		const plans = derived(() => {
			const standardPrice = standardPricing(billingPeriod);
			return [
				{
					id: "free",
					name: "Gratis",
					pricePrefix: "Filöverföringar kostar",
					price: "0 kr",
					priceSuffix: "",
					periodNote: "Gratis för alltid",
					features: [
						`Upp till ${gb(free.maxBytes)} per överföring`,
						"Lagring i 1 eller 2 dagar",
						"Dela via länk eller e-post",
						"Återupptagbara uppladdningar"
					],
					cta: "Kom igång",
					href: "/",
					disabled: false
				},
				{
					id: "standard",
					name: "Standard",
					pricePrefix: "Stora överföringar kostar",
					price: standardPrice.price,
					priceSuffix: standardPrice.suffix,
					periodNote: standardPrice.note,
					features: standardFeatures,
					cta: "Prenumerera",
					href: null,
					disabled: true
				},
				{
					id: "enterprise",
					name: "Enterprise",
					pricePrefix: "Din organisation får",
					price: "Anpassat",
					priceSuffix: "",
					periodNote: "Skräddarsytt för er organisation",
					features: [
						`Upp till ${gb(enterprise.maxBytes)} per överföring`,
						"Lagring i 5 eller 7 dagar",
						"Anpassade nedladdningssidor",
						"Teamkonton och administration",
						"EU-hosting och GDPR-verktyg",
						"Prioriterad support och SLA"
					],
					cta: "Kontakta sälj",
					href: "mailto:hello@keira.com",
					disabled: false
				}
			];
		});
		head("1hrotn9", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Priser — Keira</title>`);
			});
		});
		$$renderer.push(`<section class="pricing-page svelte-1hrotn9"><a href="/" class="pricing-page__back svelte-1hrotn9"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="svelte-1hrotn9"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"></path></svg> Tillbaka</a> <header class="pricing-page__head svelte-1hrotn9"><h1 class="pricing-page__title svelte-1hrotn9">Enkla priser</h1> <p class="pricing-page__sub svelte-1hrotn9">Börja gratis. Välj Standard om ni skickar stora filer ofta. Enterprise för organisationer
			som behöver branding, efterlevnad och support.</p></header> <div class="pricing-page__grid svelte-1hrotn9"><!--[-->`);
		const each_array = ensure_array_like(plans());
		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let plan = each_array[$$index_1];
			$$renderer.push(`<article${attr_class("pricing-card svelte-1hrotn9", void 0, { "pricing-card--featured": plan.id === "standard" })}><div class="pricing-card__top svelte-1hrotn9"><h2 class="pricing-card__name svelte-1hrotn9">${escape_html(plan.name)}</h2></div> <div class="pricing-card__pricing svelte-1hrotn9"><p class="pricing-card__price-line svelte-1hrotn9">${escape_html(plan.pricePrefix)} <strong class="pricing-card__price svelte-1hrotn9">${escape_html(plan.price)}</strong> <span${attr_class("pricing-card__price-suffix svelte-1hrotn9", void 0, { "pricing-card__price-suffix--hidden": !plan.priceSuffix })}>${escape_html(plan.priceSuffix || "/mån")}</span></p> <p class="pricing-card__period svelte-1hrotn9">${escape_html(plan.periodNote)}</p></div> <ul class="pricing-features svelte-1hrotn9"><!--[-->`);
			const each_array_1 = ensure_array_like(plan.features);
			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let feature = each_array_1[$$index];
				$$renderer.push(`<li class="pricing-feature svelte-1hrotn9"><svg class="pricing-feature__check svelte-1hrotn9" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.25 7.25a1 1 0 0 1-1.42 0l-3.25-3.25a1 1 0 1 1 1.42-1.42l2.54 2.54 6.54-6.54a1 1 0 0 1 1.42 0Z" clip-rule="evenodd"></path></svg> <span>${escape_html(feature)}</span></li>`);
			}
			$$renderer.push(`<!--]--></ul> <div class="pricing-card__footer svelte-1hrotn9">`);
			if (plan.href) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<a${attr("href", plan.href)} class="pricing-card__cta svelte-1hrotn9">${escape_html(plan.cta)}</a>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<button type="button" class="pricing-card__cta svelte-1hrotn9"${attr("disabled", plan.disabled, true)}>${escape_html(plan.disabled ? "Kommer snart" : plan.cta)}</button>`);
			}
			$$renderer.push(`<!--]--></div></article>`);
		}
		$$renderer.push(`<!--]--></div> <div class="pricing-billing svelte-1hrotn9" role="group" aria-label="Betalningsintervall"><!--[-->`);
		const each_array_2 = ensure_array_like(billingOptions);
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let option = each_array_2[$$index_2];
			$$renderer.push(`<button type="button"${attr_class("pricing-billing__btn svelte-1hrotn9", void 0, { "pricing-billing__btn--active": billingPeriod === option.id })}${attr("aria-pressed", billingPeriod === option.id)}>${escape_html(option.label)}</button>`);
		}
		$$renderer.push(`<!--]--></div></section>`);
	});
}
//#endregion
export { _page as default };
