import { H as escape_html, V as attr, a as derived, d as unsubscribe_stores, i as bind_props, l as store_get, n as attr_class, r as attr_style, s as head, u as stringify } from "../../chunks/dev.js";
import { t as page } from "../../chunks/stores.js";
import "../../chunks/auth-client.js";
import { n as PLAN_LABELS } from "../../chunks/src.js";
//#region src/lib/assets/favicon.svg
var favicon_default = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='107'%20height='128'%20viewBox='0%200%20107%20128'%3e%3ctitle%3esvelte-logo%3c/title%3e%3cpath%20d='M94.157%2022.819c-10.4-14.885-30.94-19.297-45.792-9.835L22.282%2029.608A29.92%2029.92%200%200%200%208.764%2049.65a31.5%2031.5%200%200%200%203.108%2020.231%2030%2030%200%200%200-4.477%2011.183%2031.9%2031.9%200%200%200%205.448%2024.116c10.402%2014.887%2030.942%2019.297%2045.791%209.835l26.083-16.624A29.92%2029.92%200%200%200%2098.235%2078.35a31.53%2031.53%200%200%200-3.105-20.232%2030%2030%200%200%200%204.474-11.182%2031.88%2031.88%200%200%200-5.447-24.116'%20style='fill:%23ff3e00'/%3e%3cpath%20d='M45.817%20106.582a20.72%2020.72%200%200%201-22.237-8.243%2019.17%2019.17%200%200%201-3.277-14.503%2018%2018%200%200%201%20.624-2.435l.49-1.498%201.337.981a33.6%2033.6%200%200%200%2010.203%205.098l.97.294-.09.968a5.85%205.85%200%200%200%201.052%203.878%206.24%206.24%200%200%200%206.695%202.485%205.8%205.8%200%200%200%201.603-.704L69.27%2076.28a5.43%205.43%200%200%200%202.45-3.631%205.8%205.8%200%200%200-.987-4.371%206.24%206.24%200%200%200-6.698-2.487%205.7%205.7%200%200%200-1.6.704l-9.953%206.345a19%2019%200%200%201-5.296%202.326%2020.72%2020.72%200%200%201-22.237-8.243%2019.17%2019.17%200%200%201-3.277-14.502%2017.99%2017.99%200%200%201%208.13-12.052l26.081-16.623a19%2019%200%200%201%205.3-2.329%2020.72%2020.72%200%200%201%2022.237%208.243%2019.17%2019.17%200%200%201%203.277%2014.503%2018%2018%200%200%201-.624%202.435l-.49%201.498-1.337-.98a33.6%2033.6%200%200%200-10.203-5.1l-.97-.294.09-.968a5.86%205.86%200%200%200-1.052-3.878%206.24%206.24%200%200%200-6.696-2.485%205.8%205.8%200%200%200-1.602.704L37.73%2051.72a5.42%205.42%200%200%200-2.449%203.63%205.79%205.79%200%200%200%20.986%204.372%206.24%206.24%200%200%200%206.698%202.486%205.8%205.8%200%200%200%201.602-.704l9.952-6.342a19%2019%200%200%201%205.295-2.328%2020.72%2020.72%200%200%201%2022.237%208.242%2019.17%2019.17%200%200%201%203.277%2014.503%2018%2018%200%200%201-8.13%2012.053l-26.081%2016.622a19%2019%200%200%201-5.3%202.328'%20style='fill:%23fff'/%3e%3c/svg%3e";
//#endregion
//#region src/lib/components/LoginWidget.svelte
function LoginWidget($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, mode = "login", onClose, onSuccess } = $$props;
		let email = "";
		let password = "";
		let name = "";
		let confirmPassword = "";
		let loading = false;
		if (open) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="login-widget__backdrop svelte-1un38s1" role="presentation"><div class="login-widget glass svelte-1un38s1" role="dialog" aria-modal="true" aria-labelledby="login-widget-title"><button type="button" class="login-widget__close svelte-1un38s1" aria-label="Stäng">×</button> <p class="login-widget__kicker svelte-1un38s1">Konto</p> <h2 id="login-widget-title" class="login-widget__title svelte-1un38s1">${escape_html(mode === "login" ? "Logga in" : "Registrera dig")}</h2> <div class="login-widget__tabs svelte-1un38s1" role="tablist"><button type="button" role="tab"${attr_class("login-widget__tab svelte-1un38s1", void 0, { "login-widget__tab--active": mode === "login" })}${attr("aria-selected", mode === "login")}>Logga in</button> <button type="button" role="tab"${attr_class("login-widget__tab svelte-1un38s1", void 0, { "login-widget__tab--active": mode === "register" })}${attr("aria-selected", mode === "register")}>Registrera</button></div> `);
			if (mode === "login") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<form class="login-widget__form svelte-1un38s1"><label class="glass-label">E-post <input${attr("value", email)} type="email" required="" autocomplete="email" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">Lösenord <input${attr("value", password)} type="password" required="" autocomplete="current-password" minlength="8" class="glass-input mt-1.5"/></label> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <button type="submit"${attr("disabled", loading, true)} class="btn-primary login-widget__submit svelte-1un38s1">${escape_html("Logga in")}</button></form>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<form class="login-widget__form svelte-1un38s1"><label class="glass-label">Namn <span class="login-widget__optional svelte-1un38s1">(valfritt)</span> <input${attr("value", name)} maxlength="120" autocomplete="name" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">E-post <input${attr("value", email)} type="email" required="" autocomplete="email" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">Lösenord <input${attr("value", password)} type="password" required="" minlength="8" autocomplete="new-password" class="glass-input mt-1.5"/></label> <label class="glass-label mt-3">Bekräfta lösenord <input${attr("value", confirmPassword)} type="password" required="" minlength="8" autocomplete="new-password" class="glass-input mt-1.5"/></label> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <button type="submit"${attr("disabled", loading, true)} class="btn-primary login-widget__submit svelte-1un38s1">${escape_html("Skapa konto")}</button></form>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		bind_props($$props, {
			open,
			mode
		});
	});
}
//#endregion
//#region src/lib/components/TopNavBar.svelte
function TopNavBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { session } = $$props;
		const planLabel = derived(() => session?.user?.plan ? PLAN_LABELS[session.user.plan] : "Gratis");
		const MENU_WIDTH = 248;
		let loginOpen = false;
		let loginMode = "login";
		let profileOpen = false;
		let menuTop = 0;
		let menuLeft = 0;
		function closeProfile() {
			profileOpen = false;
		}
		function userInitial(user) {
			return (user.name ?? user.email ?? "?").charAt(0).toUpperCase();
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			LoginWidget($$renderer, {
				onClose: closeProfile,
				get open() {
					return loginOpen;
				},
				set open($$value) {
					loginOpen = $$value;
					$$settled = false;
				},
				get mode() {
					return loginMode;
				},
				set mode($$value) {
					loginMode = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----> <div class="account-bar svelte-dqwfyp" data-account-bar="" aria-label="Konto"><a href="/pricing" class="account-bar__upgrade svelte-dqwfyp">Uppgradera</a> `);
			if (session?.user) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="account-bar__user svelte-dqwfyp"><button type="button"${attr_class("account-bar__profile svelte-dqwfyp", void 0, { "account-bar__profile--open": profileOpen })}${attr("aria-expanded", profileOpen)} aria-haspopup="true" aria-label="Öppna konto">`);
				if (session.user.image) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<img class="account-bar__profile-img svelte-dqwfyp"${attr("src", session.user.image)} alt="" width="28" height="28" referrerpolicy="no-referrer"/>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="account-bar__profile-initial svelte-dqwfyp">${escape_html(userInitial(session.user))}</span>`);
				}
				$$renderer.push(`<!--]--></button> `);
				if (profileOpen) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<aside class="account-menu svelte-dqwfyp" role="menu"${attr_style("", {
						top: `${stringify(menuTop)}px`,
						left: `${stringify(menuLeft)}px`,
						width: `${stringify(MENU_WIDTH)}px`
					})}><div class="account-menu__top svelte-dqwfyp"><p class="account-menu__email svelte-dqwfyp"${attr("title", session.user.email ?? void 0)}>${escape_html(session.user.email ?? session.user.name)}</p> <p class="account-menu__plan svelte-dqwfyp">${escape_html(planLabel())}</p></div> <div class="account-menu__links svelte-dqwfyp"><a href="/installningar" role="menuitem" class="account-menu__link svelte-dqwfyp">Inställningar</a> <a href="/pricing" role="menuitem" class="account-menu__link svelte-dqwfyp">Prenumeration</a> <button type="button" role="menuitem" class="account-menu__link account-menu__link--out svelte-dqwfyp">Logga ut</button></div></aside>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="account-bar__guest svelte-dqwfyp"><button type="button" class="account-bar__guest-btn svelte-dqwfyp">Logga in</button> <button type="button" class="account-bar__guest-btn account-bar__guest-btn--fill svelte-dqwfyp">Skapa konto</button></div>`);
			}
			$$renderer.push(`<!--]--> <a href="/support" class="account-bar__help svelte-dqwfyp" aria-label="Hjälp och support"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" class="svelte-dqwfyp"><circle cx="12" cy="12" r="9.25"></circle><path stroke-linecap="round" d="M9.75 9.5a2.25 2.25 0 1 1 3.6 1.85c-.7.47-1.1 1-1.1 1.9v.15"></path><circle cx="12" cy="16.75" r="0.85" fill="currentColor" stroke="none"></circle></svg></a></div>`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}
//#endregion
//#region src/lib/components/BackgroundVideoControls.svelte
function BackgroundVideoControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { video } = $$props;
		$$renderer.push(`<div class="video-ctrl glass svelte-w1a0g1" role="group" aria-label="Bakgrundsvideo"><button type="button" class="video-ctrl__btn svelte-w1a0g1"${attr("aria-label", "Pausa bakgrundsvideo")}>`);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="svelte-w1a0g1"><path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z"></path></svg>`);
		$$renderer.push(`<!--]--></button> <button type="button" class="video-ctrl__btn svelte-w1a0g1"${attr("aria-label", "Slå på ljud")}>`);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" class="svelte-w1a0g1"><path stroke-linecap="round" stroke-width="2" d="M11 5 6 9H3v6h3l5 4V5zm7.07 2.93a10 10 0 0 1 0 8.14M15.54 8.46a5 5 0 0 1 0 7.07"></path><path stroke-linecap="round" stroke-width="2" d="m2 2 20 20"></path></svg>`);
		$$renderer.push(`<!--]--></button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button type="button" class="video-ctrl__btn svelte-w1a0g1" aria-label="Starta om bakgrundsvideo"><svg class="video-ctrl__replay svelte-w1a0g1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 1-7.8 13.5"></path><path d="M7 6.5 12 3 12 8.5"></path></svg></button></div>`);
	});
}
//#endregion
//#region src/lib/components/BackgroundVideoCountdown.svelte
function BackgroundVideoCountdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { video } = $$props;
		let remainingSeconds = 0;
		function formatCountdown(seconds) {
			const total = Math.max(0, Math.ceil(seconds));
			return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
		}
		derived(() => formatCountdown(remainingSeconds));
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children, data } = $$props;
		let bgVideo = null;
		const darkOverlayRoutes = [
			"/pricing",
			"/support",
			"/logga-in",
			"/registrera",
			"/installningar"
		];
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Keira — Säker filöverföring</title>`);
			});
			$$renderer.push(`<link rel="icon"${attr("href", favicon_default)}/> <link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/> <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&amp;family=Outfit:wght@500;600;700;800&amp;display=swap" rel="stylesheet"/>`);
		});
		$$renderer.push(`<div class="shell svelte-12qhfyh"><div class="shell__bg svelte-12qhfyh" aria-hidden="true"><video class="shell__video svelte-12qhfyh" autoplay="" muted="" loop="" playsinline="" preload="auto"><source src="/background.mp4" type="video/mp4"/></video> `);
		if (darkOverlayRoutes.includes(store_get($$store_subs ??= {}, "$page", page).url.pathname)) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="shell__overlay svelte-12qhfyh"></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="shell__vignette svelte-12qhfyh"></div> <div class="shell__grain svelte-12qhfyh"></div></div> <header class="shell__header svelte-12qhfyh"><a href="/" class="shell__logo svelte-12qhfyh"><span class="shell__logo-mark">Kei</span><span class="shell__logo-accent svelte-12qhfyh">ra</span></a> `);
		TopNavBar($$renderer, { session: data.session });
		$$renderer.push(`<!----></header> <main class="shell__main svelte-12qhfyh">`);
		children($$renderer);
		$$renderer.push(`<!----></main> <footer class="shell__footer svelte-12qhfyh"><div class="shell__footer-left svelte-12qhfyh">`);
		BackgroundVideoControls($$renderer, { video: bgVideo });
		$$renderer.push(`<!----> <span class="shell__footer-brand svelte-12qhfyh">Keira</span> `);
		BackgroundVideoCountdown($$renderer, { video: bgVideo });
		$$renderer.push(`<!----></div> <span class="shell__footer-credit">Skapat och förbehållet av CERCINO</span></footer></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _layout as default };
