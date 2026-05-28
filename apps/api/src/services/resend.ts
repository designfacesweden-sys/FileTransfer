import { Resend } from 'resend';
import { config } from '../config.js';

export interface ResendEmailOptions {
	to: string[];
	subject: string;
	html: string;
	replyTo?: string;
	from?: string;
}

let client: Resend | null = null;

function getResend(): Resend {
	if (!config.resendApiKey) {
		throw new Error('RESEND_API_KEY is not configured');
	}
	if (!client) {
		client = new Resend(config.resendApiKey);
	}
	return client;
}

export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

export async function sendResendEmail(options: ResendEmailOptions): Promise<void> {
	const resend = getResend();

	const { error } = await resend.emails.send({
		from: options.from ?? config.transferFromEmail,
		to: options.to,
		replyTo: options.replyTo,
		subject: options.subject,
		html: options.html
	});

	if (error) {
		throw new Error(`Resend failed: ${error.message}`);
	}
}
