import { translateApiError } from '$lib/i18n/api-errors';
import { PUBLIC_API_URL } from '$env/static/public';
import type {
  AuthUser,
  CreateTransferRequest,
  CreateTransferResponse,
  TransferNotifyResponse,
  RegisterRequest,
  SupportRequest,
  SupportRequestResponse,
  TransferPublic
} from '@filetransfer/shared';

const base = PUBLIC_API_URL || 'http://localhost:3001';

export async function createTransfer(body: CreateTransferRequest): Promise<CreateTransferResponse> {
  const res = await fetch(`${base}/api/transfers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(translateApiError(err.error ?? err.message ?? 'Kunde inte skapa överföring'));
  }

  return res.json();
}

export async function notifyTransferByEmail(token: string): Promise<TransferNotifyResponse> {
  const res = await fetch(`${base}/api/transfers/${token}/notify`, { method: 'POST' });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(translateApiError(err.error ?? err.message ?? 'Kunde inte skicka e-post'));
  }

  return res.json();
}

export async function getTransfer(token: string, password?: string): Promise<TransferPublic> {
  const params = password ? `?password=${encodeURIComponent(password)}` : '';
  const res = await fetch(`${base}/api/transfers/${token}${params}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(translateApiError(err.error ?? 'Kunde inte ladda överföringen'));
  }

  return res.json();
}

export async function submitSupport(body: SupportRequest): Promise<SupportRequestResponse> {
  const res = await fetch(`${base}/api/support`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(translateApiError(err.error ?? 'Kunde inte skicka supportförfrågan'));
  }

  return res.json();
}

export async function registerUser(body: RegisterRequest): Promise<AuthUser> {
  const res = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Registreringen misslyckades');
  }

  return res.json();
}

export function downloadUrl(fileId: string, password?: string): string {
  const params = password ? `?password=${encodeURIComponent(password)}` : '';
  return `${base}/api/downloads/${fileId}${params}`;
}
