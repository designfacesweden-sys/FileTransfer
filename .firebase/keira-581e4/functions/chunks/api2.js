import "./public.js";
//#region src/lib/server/api.ts
var apiBase = "http://localhost:3001";
var PLAN_IDS = [
	"free",
	"standard",
	"enterprise"
];
function normalizePlan(plan) {
	if (plan && PLAN_IDS.includes(plan)) return plan;
	return "free";
}
function normalizeAuthUser(raw) {
	return {
		id: raw.id,
		email: raw.email,
		name: raw.name,
		plan: normalizePlan(raw.plan)
	};
}
async function fetchAuthUser(fetchFn, userId) {
	const res = await fetchFn(`${apiBase}/api/auth/me/${userId}`);
	if (!res.ok) return {
		ok: false,
		status: res.status
	};
	return {
		ok: true,
		user: normalizeAuthUser(await res.json())
	};
}
async function patchAuthProfile(fetchFn, userId, name) {
	const res = await fetchFn(`${apiBase}/api/auth/profile/${userId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name })
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		return {
			ok: false,
			status: res.status,
			error: body.error ?? "Kunde inte spara profilen."
		};
	}
	return {
		ok: true,
		user: normalizeAuthUser(await res.json())
	};
}
//#endregion
export { fetchAuthUser as n, patchAuthProfile as r, apiBase as t };
