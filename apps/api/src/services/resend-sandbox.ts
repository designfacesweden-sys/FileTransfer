import { config } from '../config.js';

export interface ResolvedRecipient {
	to: string;
	intendedTo?: string;
}

/** Resend sandbox (onboarding@resend.dev) only delivers to your account email. */
export function isResendSandboxSender(from?: string): boolean {
	const value = from ?? config.transferFromEmail;
	return /onboarding@resend\.dev/i.test(value) || /@resend\.dev/i.test(value);
}

export function resolveResendRecipient(intended: string, from?: string): ResolvedRecipient {
	const normalized = intended.trim().toLowerCase();

	if (!isResendSandboxSender(from)) {
		return { to: intended.trim() };
	}

	const allowed = (config.resendAccountEmail ?? config.supportInbox).trim().toLowerCase();
	if (!allowed) {
		return { to: intended.trim() };
	}

	if (normalized === allowed) {
		return { to: intended.trim() };
	}

	const redirect = config.resendDevRedirectTo?.trim();
	if (redirect) {
		console.log(
			`[Email] Resend sandbox: redirecting ${intended.trim()} → ${redirect} (set RESEND_DEV_REDIRECT_TO= to disable)`
		);
		return { to: redirect, intendedTo: intended.trim() };
	}

	throw new Error(
		`Resend test mode: with onboarding@resend.dev you can only send to ${allowed}. ` +
			`Verify cercino.se at resend.com/domains and set TRANSFER_FROM_EMAIL to e.g. FjordSend <noreply@cercino.se>, ` +
			`or add RESEND_DEV_REDIRECT_TO=${allowed} in apps/api/.env for local testing.`
	);
}
