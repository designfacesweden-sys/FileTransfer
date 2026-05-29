import { H as escape_html, V as attr, a as derived, n as attr_class, o as ensure_array_like, r as attr_style, u as stringify } from "../../chunks/dev.js";
import { r as getExpiryOptionsForPlan, t as PLANS } from "../../chunks/src.js";
import "../../chunks/navigation.js";
import "tus-js-client";
//#region src/lib/components/Toast.svelte
function Toast($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { message = "", visible = false, onclose } = $$props;
		if (visible && message) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="toast svelte-1cpok13" role="status" aria-live="polite"><p class="toast__message svelte-1cpok13">${escape_html(message)}</p> <button type="button" class="toast__close svelte-1cpok13" aria-label="Stäng">×</button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/components/TransferDockIcon.svelte
function TransferDockIcon($$renderer, $$props) {
	let { name } = $$props;
	$$renderer.push(`<svg class="transfer-dock-icon svelte-t8pcqv" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`);
	if (name === "link") {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<path d="M9 17H7A5 5 0 0 1 7 7h2"></path><path d="M15 7h2a5 5 0 0 1 0 10h-2"></path><line x1="8" x2="16" y1="12" y2="12"></line>`);
	} else if (name === "mail") {
		$$renderer.push("<!--[1-->");
		$$renderer.push(`<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>`);
	} else if (name === "lock") {
		$$renderer.push("<!--[2-->");
		$$renderer.push(`<rect width="18" height="11" x="3" y="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`);
	} else if (name === "card") {
		$$renderer.push("<!--[3-->");
		$$renderer.push(`<rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></svg>`);
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let files = [];
		let recipientEmail = "";
		let senderEmail = "";
		const userPlan = derived(() => data.session?.user?.plan ?? "free");
		const expiryOptions = derived(() => getExpiryOptionsForPlan(userPlan()));
		const planConfig = derived(() => PLANS[userPlan()]);
		let expiryPreset = "1d";
		let step = "idle";
		let progress = null;
		let dragOver = false;
		let expiryOpen = false;
		let deliveryMode = "link";
		let passwordEnabled = false;
		let toastMessage = "";
		let toastVisible = false;
		let toastTimer = null;
		derived(() => planConfig().maxBytes);
		const canUsePassword = derived(() => planConfig().passwordProtection);
		const expiryLabel = derived(() => expiryOptions().find((o) => o.id === expiryPreset)?.label ?? "1 dag");
		function dismissToast() {
			if (toastTimer) clearTimeout(toastTimer);
			toastTimer = null;
			toastVisible = false;
		}
		function formatBytes(bytes) {
			const units = [
				"B",
				"KB",
				"MB",
				"GB"
			];
			let value = bytes;
			let i = 0;
			while (value >= 1024 && i < units.length - 1) {
				value /= 1024;
				i++;
			}
			return `${value.toFixed(1)} ${units[i]}`;
		}
		$$renderer.push(`<input type="file" multiple="" class="sr-only svelte-1uha8ag" aria-hidden="true"/> <input type="file" multiple="" class="sr-only svelte-1uha8ag" webkitdirectory="" aria-hidden="true"/> <div class="home svelte-1uha8ag"><div${attr_class("transfer-dock glass svelte-1uha8ag", void 0, {
			"transfer-dock--drag": dragOver,
			"transfer-dock--expanded": step !== "idle",
			"transfer-dock--done": step === "done"
		})} role="region" aria-label="Filöverföring">`);
		$$renderer.push("<!--[-1-->");
		if (files.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="transfer-dock__files-bar svelte-1uha8ag"><div class="transfer-dock__files svelte-1uha8ag"><!--[-->`);
			const each_array = ensure_array_like(files);
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let file = each_array[i];
				$$renderer.push(`<div class="transfer-dock__chip svelte-1uha8ag"><span class="transfer-dock__chip-name svelte-1uha8ag"${attr("title", file.name)}>${escape_html(file.name)}</span> <span class="transfer-dock__chip-size svelte-1uha8ag">${escape_html(formatBytes(file.size))}</span> `);
				if (step !== "uploading") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button type="button" class="transfer-dock__chip-remove svelte-1uha8ag"${attr("aria-label", `Ta bort ${stringify(file.name)}`)}>×</button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (step === "ready" || step === "uploading") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="transfer-dock__toolbar svelte-1uha8ag"><div class="transfer-dock__tools svelte-1uha8ag"><span class="transfer-dock__tip-wrap svelte-1uha8ag"><button type="button"${attr_class("transfer-dock__tool svelte-1uha8ag", void 0, { "transfer-dock__tool--active": deliveryMode === "link" })} aria-label="Skapa länk"${attr("aria-pressed", deliveryMode === "link")}${attr("disabled", step === "uploading", true)}>`);
				TransferDockIcon($$renderer, { name: "link" });
				$$renderer.push(`<!----></button> <span class="transfer-dock__tip svelte-1uha8ag" role="tooltip">Skapa länk</span></span> <span class="transfer-dock__tip-wrap svelte-1uha8ag"><button type="button"${attr_class("transfer-dock__tool svelte-1uha8ag", void 0, { "transfer-dock__tool--active": deliveryMode === "email" })} aria-label="Skicka via e-post"${attr("aria-pressed", deliveryMode === "email")}${attr("disabled", step === "uploading", true)}>`);
				TransferDockIcon($$renderer, { name: "mail" });
				$$renderer.push(`<!----></button> <span class="transfer-dock__tip svelte-1uha8ag" role="tooltip">Skicka via e-post</span></span> <span class="transfer-dock__tip-wrap svelte-1uha8ag"><button type="button"${attr_class("transfer-dock__tool transfer-dock__tool--premium svelte-1uha8ag", void 0, { "transfer-dock__tool--active": passwordEnabled })} aria-label="Lägg till lösenord"${attr("aria-pressed", passwordEnabled)}${attr("disabled", step === "uploading", true)}>`);
				TransferDockIcon($$renderer, { name: "lock" });
				$$renderer.push(`<!----></button> <span class="transfer-dock__tip svelte-1uha8ag" role="tooltip">${escape_html(canUsePassword() ? "Lägg till lösenord" : "Lägg till lösenord — Standard-plan")}</span></span> <span class="transfer-dock__tip-wrap svelte-1uha8ag"><button type="button" class="transfer-dock__tool transfer-dock__tool--premium svelte-1uha8ag" aria-label="Lägg till betalvägg"${attr("disabled", step === "uploading", true)}>`);
				TransferDockIcon($$renderer, { name: "card" });
				$$renderer.push(`<!----></button> <span class="transfer-dock__tip svelte-1uha8ag" role="tooltip">Lägg till betalvägg</span></span></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="transfer-dock__row svelte-1uha8ag">`);
		if (step === "idle") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button type="button" class="transfer-dock__add svelte-1uha8ag" aria-label="Lägg till filer"><img src="/cloud-computing.png" alt="" class="transfer-dock__add-icon svelte-1uha8ag" width="28" height="28"/></button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (step === "idle") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button type="button" class="transfer-dock__prompt svelte-1uha8ag"><span class="transfer-dock__prompt-title svelte-1uha8ag">${escape_html("Lägg till dina filer")}</span> <span class="transfer-dock__prompt-sub svelte-1uha8ag">eller dra och släpp · upp till 2 GB per fil</span></button>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="transfer-dock__fields svelte-1uha8ag">`);
			if (deliveryMode === "email") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<input type="email"${attr("value", recipientEmail)} placeholder="E-post till" autocomplete="email"${attr("disabled", step === "uploading", true)} class="transfer-dock__input svelte-1uha8ag"/> <input type="email"${attr("value", senderEmail)} placeholder="Din e-post (valfritt)" autocomplete="email"${attr("disabled", step === "uploading", true)} class="transfer-dock__input svelte-1uha8ag"/>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<p class="transfer-dock__link-hint svelte-1uha8ag">Få en länk att dela efter överföringen</p>`);
			}
			$$renderer.push(`<!--]--> <div class="transfer-dock__expiry-wrap svelte-1uha8ag"><button type="button" class="transfer-dock__input transfer-dock__expiry-trigger svelte-1uha8ag" aria-label="Lagringstid" aria-haspopup="listbox"${attr("aria-expanded", expiryOpen)}${attr("disabled", step === "uploading", true)}><span>${escape_html(expiryLabel())}</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="svelte-1uha8ag"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]--> `);
		if (step === "ready") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button type="button" class="transfer-dock__send svelte-1uha8ag">Överför</button>`);
		} else if (step === "uploading") {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="transfer-dock__uploading svelte-1uha8ag"><span class="transfer-dock__upload-pct svelte-1uha8ag">${escape_html(progress?.percentage ?? 0)}%</span> <div class="transfer-dock__upload-track svelte-1uha8ag"><div class="transfer-dock__upload-bar svelte-1uha8ag"${attr_style(`width: ${stringify(progress?.percentage ?? 0)}%`)}></div></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (step === "ready" || step === "uploading") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="transfer-dock__footer svelte-1uha8ag"><button type="button" class="transfer-dock__link-btn svelte-1uha8ag"${attr("disabled", step === "uploading", true)}>Avbryt</button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div> `);
		Toast($$renderer, {
			message: toastMessage,
			visible: toastVisible,
			onclose: dismissToast
		});
		$$renderer.push(`<!---->`);
	});
}
//#endregion
export { _page as default };
