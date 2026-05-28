import { config } from '../config.js';
import { escapeHtml, sendResendEmail } from './resend.js';
import { resolveResendRecipient } from './resend-sandbox.js';

export interface TransferEmailPayload {
	token: string;
	recipientEmail: string;
	senderEmail: string | null;
	downloadUrl: string;
	expiresAt: string;
	files: { name: string; size: number }[];
	title: string | null;
	message: string | null;
	passwordProtected: boolean;
	devRedirectNote?: string;
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatExpiry(iso: string): string {
	return new Date(iso).toLocaleString('sv-SE', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
}

function buildTransferHtml(payload: TransferEmailPayload): string {
	const fileRows = payload.files
		.map(
			(f) =>
				`<li style="margin:0.25rem 0">${escapeHtml(f.name)} <span style="color:#78716c">(${formatBytes(f.size)})</span></li>`
		)
		.join('');

	const senderLine = payload.senderEmail
		? `<p style="margin:0 0 1rem;color:#44403c">${escapeHtml(payload.senderEmail)} har delat filer med dig.</p>`
		: `<p style="margin:0 0 1rem;color:#44403c">Du har fått filer.</p>`;

	const messageBlock = payload.message
		? `<p style="margin:0 0 1rem;padding:0.75rem 1rem;background:#f5f5f4;border-radius:8px;color:#292524">${escapeHtml(payload.message)}</p>`
		: '';

	const passwordNote = payload.passwordProtected
		? `<p style="margin:1rem 0 0;font-size:0.875rem;color:#78716c">Överföringen är lösenordsskyddad. Avsändaren delar lösenordet med dig separat.</p>`
		: '';

	const devNote = payload.devRedirectNote
		? `<p style="margin:0 0 1rem;padding:0.5rem 0.75rem;background:#fef3c7;border-radius:6px;font-size:0.8125rem;color:#92400e">${escapeHtml(payload.devRedirectNote)}</p>`
		: '';

	return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#1c1917;max-width:32rem;margin:0 auto;padding:1.5rem">
  <h1 style="font-size:1.25rem;font-weight:700;margin:0 0 0.5rem">${escapeHtml(payload.title ?? 'Filer till dig')}</h1>
  ${devNote}
  ${senderLine}
  ${messageBlock}
  <ul style="margin:0 0 1.25rem;padding-left:1.25rem">${fileRows}</ul>
  <p style="margin:0 0 1rem">
    <a href="${escapeHtml(payload.downloadUrl)}" style="display:inline-block;background:#0c0a09;color:#fafaf9;text-decoration:none;font-weight:600;padding:0.625rem 1.25rem;border-radius:8px">Ladda ner filer</a>
  </p>
  <p style="margin:0;font-size:0.875rem;color:#78716c">Länken går ut ${escapeHtml(formatExpiry(payload.expiresAt))}.</p>
  ${passwordNote}
  <p style="margin:1.5rem 0 0;font-size:0.75rem;color:#a8a29e">Keira — säker filöverföring</p>
</body>
</html>`;
}

export async function notifyTransferRecipient(
	payload: TransferEmailPayload
): Promise<{ sentTo: string; intendedTo?: string }> {
	const { to, intendedTo } = resolveResendRecipient(payload.recipientEmail);
	const subject = payload.title
		? `${payload.title} — ladda ner dina filer`
		: 'Du har filer att ladda ner';

	const devRedirectNote = intendedTo
		? `[Dev] Det här mejlet var avsett för ${intendedTo}. Resend-testläge tillåter bara ${config.resendAccountEmail || config.supportInbox}.`
		: undefined;

	await sendResendEmail({
		to: [to],
		subject: intendedTo ? `[Dev] ${subject}` : subject,
		html: buildTransferHtml({ ...payload, devRedirectNote }),
		replyTo: payload.senderEmail ?? undefined
	});

	console.log(`[Email] Transfer notification sent to ${to} (${payload.token})`);
	return { sentTo: to, intendedTo };
}

export async function notifyTransferSenderCopy(payload: TransferEmailPayload): Promise<void> {
	if (!payload.senderEmail) return;

	const { to } = resolveResendRecipient(payload.senderEmail);

	const html = `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#1c1917;max-width:32rem;margin:0 auto;padding:1.5rem">
  <h1 style="font-size:1.25rem;font-weight:700;margin:0 0 0.5rem">Överföring skickad</h1>
  <p style="margin:0 0 1rem;color:#44403c">Dina filer skickades till <strong>${escapeHtml(payload.recipientEmail)}</strong>.</p>
  <p style="margin:0 0 1rem">
    <a href="${escapeHtml(payload.downloadUrl)}" style="color:#0c0a09">Visa nedladdningssida</a>
  </p>
  <p style="margin:0;font-size:0.875rem;color:#78716c">Går ut ${escapeHtml(formatExpiry(payload.expiresAt))}.</p>
</body>
</html>`;

	await sendResendEmail({
		to: [to],
		subject: 'Kopia: din filöverföring skickades',
		html,
		replyTo: config.supportInbox
	});
}
