//#region ../../packages/shared/src/index.ts
var PLANS = {
	free: {
		maxBytes: 2 * 1024 * 1024 * 1024,
		defaultExpiryDays: 1,
		maxExpiryDays: 2,
		passwordProtection: false,
		customBranding: false,
		analytics: false
	},
	standard: {
		maxBytes: 20 * 1024 * 1024 * 1024,
		defaultExpiryDays: 5,
		maxExpiryDays: 7,
		passwordProtection: true,
		customBranding: false,
		analytics: true
	},
	enterprise: {
		maxBytes: 100 * 1024 * 1024 * 1024,
		defaultExpiryDays: 5,
		maxExpiryDays: 7,
		passwordProtection: true,
		customBranding: true,
		analytics: true
	}
};
var EXPIRY_PRESETS = {
	"1d": {
		label: "1 dag",
		days: 1
	},
	"2d": {
		label: "2 dagar",
		days: 2
	},
	"5d": {
		label: "5 dagar",
		days: 5
	},
	"7d": {
		label: "7 dagar",
		days: 7
	}
};
var DAY_SECONDS = 1440 * 60;
/** Expiry choices shown in the transfer UI per plan */
var PLAN_EXPIRY_PRESETS = {
	free: ["1d", "2d"],
	standard: ["5d", "7d"],
	enterprise: ["5d", "7d"]
};
function getExpiryOptionsForPlan(plan) {
	return PLAN_EXPIRY_PRESETS[plan].map((id) => ({
		id,
		label: EXPIRY_PRESETS[id].label,
		seconds: EXPIRY_PRESETS[id].days * DAY_SECONDS
	}));
}
var PLAN_LABELS = {
	free: "Gratis",
	standard: "Standard",
	enterprise: "Enterprise"
};
//#endregion
export { PLAN_LABELS as n, getExpiryOptionsForPlan as r, PLANS as t };
