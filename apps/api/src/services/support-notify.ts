import { config } from '../config.js';
import { escapeHtml, sendResendEmail } from './resend.js';

export interface SupportPayload {
  id: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  createdAt: string;
}

export async function notifySupportTeam(payload: SupportPayload): Promise<void> {
  const tasks: Promise<void>[] = [];

  if (config.supportWebhookUrl) {
    tasks.push(notifyWebhook(payload));
  }

  if (config.resendApiKey) {
    tasks.push(notifyEmail(payload));
  }

  await Promise.allSettled(tasks);

  if (!config.supportWebhookUrl && !config.resendApiKey) {
    console.log('[Support] New request stored (configure RESEND_API_KEY or SUPPORT_WEBHOOK_URL to forward):', {
      id: payload.id,
      from: payload.email,
      subject: payload.subject
    });
  }
}

async function notifyWebhook(payload: SupportPayload): Promise<void> {
  const res = await fetch(config.supportWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: formatSupportText(payload),
      payload
    })
  });

  if (!res.ok) {
    throw new Error(`Support webhook failed: ${res.status}`);
  }
}

async function notifyEmail(payload: SupportPayload): Promise<void> {
  const html = `
    <h2>New support request</h2>
    <p><strong>ID:</strong> ${payload.id}</p>
    <p><strong>From:</strong> ${escapeHtml(payload.name)} &lt;${escapeHtml(payload.email)}&gt;</p>
    <p><strong>Category:</strong> ${escapeHtml(payload.category)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;font-family:sans-serif">${escapeHtml(payload.message)}</pre>
  `;

  await sendResendEmail({
    from: config.supportFromEmail,
    to: [config.supportInbox],
    replyTo: payload.email,
    subject: `[Support] ${payload.subject}`,
    html
  });
}

function formatSupportText(payload: SupportPayload): string {
  return [
    `New support request (${payload.id})`,
    `From: ${payload.name} <${payload.email}>`,
    `Category: ${payload.category}`,
    `Subject: ${payload.subject}`,
    '',
    payload.message
  ].join('\n');
}
