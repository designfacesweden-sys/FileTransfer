import { g as base, t as building, u as private_env } from "../chunks/environment.js";
import "../chunks/paths.js";
import { n as PUBLIC_SUPABASE_PUBLISHABLE_KEY, r as PUBLIC_SUPABASE_URL } from "../chunks/public.js";
import { t as apiBase } from "../chunks/api2.js";
import { redirect } from "@sveltejs/kit";
import { parse } from "set-cookie-parser";
import { sequence } from "@sveltejs/kit/hooks";
import { Auth, createActionURL, isAuthAction, raw, setEnvDefaults, skipCSRFCheck } from "@auth/core";
import "@auth/core/errors";
import credentials_default from "@auth/core/providers/credentials";
import "@auth/core/providers/google";
import { createServerClient } from "@supabase/ssr";
//#region ../../node_modules/@auth/sveltekit/dist/env.js
function setEnvDefaults$1(envObject, config) {
	config.trustHost ??= false;
	config.basePath = `${base}/auth`;
	config.skipCSRFCheck = skipCSRFCheck;
	if (building) return;
	setEnvDefaults(envObject, config);
}
//#endregion
//#region ../../node_modules/@auth/sveltekit/dist/actions.js
async function signIn$1(provider, options = {}, authorizationParams, config, event) {
	const { request, url: { protocol } } = event;
	const headers = new Headers(request.headers);
	const { redirect: shouldRedirect = true, redirectTo, ...rest } = options instanceof FormData ? Object.fromEntries(options) : options;
	const callbackUrl = redirectTo?.toString() ?? headers.get("Referer") ?? "/";
	const signInURL = createActionURL("signin", protocol, headers, private_env, config);
	if (!provider) {
		signInURL.searchParams.append("callbackUrl", callbackUrl);
		if (shouldRedirect) redirect(302, signInURL.toString());
		return signInURL.toString();
	}
	let url = `${signInURL}/${provider}?${new URLSearchParams(authorizationParams)}`;
	let foundProvider = {};
	for (const providerConfig of config.providers) {
		const { options, ...defaults } = typeof providerConfig === "function" ? providerConfig() : providerConfig;
		const id = options?.id ?? defaults.id;
		if (id === provider) {
			foundProvider = {
				id,
				type: options?.type ?? defaults.type
			};
			break;
		}
	}
	if (!foundProvider.id) {
		const url = `${signInURL}?${new URLSearchParams({ callbackUrl })}`;
		if (shouldRedirect) redirect(302, url);
		return url;
	}
	if (foundProvider.type === "credentials") url = url.replace("signin", "callback");
	headers.set("Content-Type", "application/x-www-form-urlencoded");
	const body = new URLSearchParams({
		...rest,
		callbackUrl
	});
	const res = await Auth(new Request(url, {
		method: "POST",
		headers,
		body
	}), {
		...config,
		raw
	});
	for (const c of res?.cookies ?? []) event.cookies.set(c.name, c.value, {
		path: "/",
		...c.options
	});
	if (shouldRedirect) return redirect(302, res.redirect);
	return res.redirect;
}
async function signOut$1(options, config, event) {
	const { request, url: { protocol } } = event;
	const headers = new Headers(request.headers);
	headers.set("Content-Type", "application/x-www-form-urlencoded");
	const url = createActionURL("signout", protocol, headers, private_env, config);
	const callbackUrl = options?.redirectTo ?? headers.get("Referer") ?? "/";
	const body = new URLSearchParams({ callbackUrl });
	const res = await Auth(new Request(url, {
		method: "POST",
		headers,
		body
	}), {
		...config,
		raw
	});
	for (const c of res?.cookies ?? []) event.cookies.set(c.name, c.value, {
		path: "/",
		...c.options
	});
	if (options?.redirect ?? true) return redirect(302, res.redirect);
	return res;
}
async function auth(event, config) {
	setEnvDefaults$1(private_env, config);
	config.trustHost ??= true;
	const { request: req, url: { protocol } } = event;
	const sessionUrl = createActionURL("session", protocol, req.headers, private_env, config);
	const response = await Auth(new Request(sessionUrl, { headers: { cookie: req.headers.get("cookie") ?? "" } }), config);
	const authCookies = parse(response.headers.getSetCookie());
	for (const cookie of authCookies) {
		const { name, value, ...options } = cookie;
		event.cookies.set(name, value, {
			path: "/",
			...options
		});
	}
	const { status = 200 } = response;
	const data = await response.json();
	if (!data || !Object.keys(data).length) return null;
	if (status === 200) return data;
	throw new Error(data.message);
}
//#endregion
//#region ../../node_modules/@auth/sveltekit/dist/index.js
var authorizationParamsPrefix = "authorizationParams-";
/**
* The main entry point to `@auth/sveltekit`
* @see https://sveltekit.authjs.dev
*/
function SvelteKitAuth(config) {
	return {
		signIn: async (event) => {
			if (building) return;
			const { request } = event;
			const _config = typeof config === "object" ? config : await config(event);
			setEnvDefaults$1(private_env, _config);
			const formData = await request.formData();
			const { providerId: provider, ...options } = Object.fromEntries(formData);
			const authorizationParams = {};
			const _options = {};
			for (const key in options) if (key.startsWith(authorizationParamsPrefix)) authorizationParams[key.slice(20)] = options[key];
			else _options[key] = options[key];
			await signIn$1(provider, _options, authorizationParams, _config, event);
		},
		signOut: async (event) => {
			if (building) return;
			const _config = typeof config === "object" ? config : await config(event);
			setEnvDefaults$1(private_env, _config);
			await signOut$1(Object.fromEntries(await event.request.formData()), _config, event);
		},
		async handle({ event, resolve }) {
			if (building) {
				event.locals.auth ??= async () => null;
				event.locals.getSession ??= event.locals.auth;
				return resolve(event);
			}
			const _config = typeof config === "object" ? config : await config(event);
			setEnvDefaults$1(private_env, _config);
			const { url, request } = event;
			event.locals.auth ??= () => auth(event, _config);
			event.locals.getSession ??= event.locals.auth;
			const action = url.pathname.slice(_config.basePath.length + 1).split("/")[0];
			if (isAuthAction(action) && url.pathname.startsWith(_config.basePath + "/")) return Auth(request, _config);
			return resolve(event);
		}
	};
}
var { handle: handle$1, signIn, signOut } = SvelteKitAuth({
	providers: [credentials_default({
		name: "credentials",
		credentials: {
			email: {
				label: "E-post",
				type: "email"
			},
			password: {
				label: "Lösenord",
				type: "password"
			}
		},
		async authorize(credentials) {
			const email = credentials?.email;
			const password = credentials?.password;
			if (typeof email !== "string" || typeof password !== "string") return null;
			const res = await fetch(`${apiBase}/api/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					password
				})
			});
			if (!res.ok) return null;
			const user = await res.json();
			return {
				id: user.id,
				email: user.email,
				name: user.name ?? user.email,
				plan: user.plan
			};
		}
	})],
	secret: "6db9230a660ae5601a5f72e270748d2a2ac5ce9f217893f57eaf020429adc57f",
	trustHost: true,
	pages: { signIn: "/logga-in" },
	session: { strategy: "jwt" },
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			if (user) {
				const u = user;
				token.sub = u.id;
				token.plan = u.plan ?? "free";
				token.name = u.name ?? u.email;
				token.email = u.email;
			}
			if (trigger === "update" && session) {
				const patch = session;
				if (patch.name !== void 0) token.name = patch.name ?? token.email;
				if (patch.plan !== void 0) token.plan = patch.plan;
			}
			return token;
		},
		async session({ session, token }) {
			if (!session.user || !token.sub) return session;
			session.user.id = token.sub;
			try {
				const res = await fetch(`${apiBase}/api/auth/me/${token.sub}`);
				if (res.ok) {
					const user = await res.json();
					session.user.plan = user.plan ?? "free";
					session.user.name = user.name ?? user.email;
					session.user.email = user.email;
					return session;
				}
			} catch {}
			session.user.plan = token.plan ?? "free";
			if (typeof token.name === "string") session.user.name = token.name;
			if (typeof token.email === "string") session.user.email = token.email;
			return session;
		}
	}
});
//#endregion
//#region src/lib/supabase/server.ts
var createClient = (event) => createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, { cookies: {
	getAll() {
		return event.cookies.getAll();
	},
	setAll(cookiesToSet) {
		for (const { name, value, options } of cookiesToSet) event.cookies.set(name, value, {
			...options,
			path: "/"
		});
	}
} });
//#endregion
//#region src/lib/supabase/middleware.ts
var updateSupabaseSession = async ({ event, resolve }) => {
	await createClient(event).auth.getUser();
	return resolve(event);
};
//#endregion
//#region src/hooks.server.ts
var handle = sequence(updateSupabaseSession, handle$1);
//#endregion
export { handle };
