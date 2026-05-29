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

async function readJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'API svarade med HTML i stället för JSON. Kontrollera PUBLIC_API_URL (Render API-URL, inte keira.se).'
    );
  }
  return res.json() as Promise<T>;
}

export async function createTransfer(body: CreateTransferRequest): Promise<CreateTransferResponse> {
  const res = await fetch(`${base}/api/transfers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await readJson<{ error?: string; message?: string }>(res).catch(() => ({}));
    throw new Error(translateApiError(err.error ?? err.message ?? 'Kunde inte skapa överföring'));
  }

  return readJson<CreateTransferResponse>(res);
}

export async function notifyTransferByEmail(token: string): Promise<TransferNotifyResponse> {
  const res = await fetch(`${base}/api/transfers/${token}/notify`, { method: 'POST' });

  if (!res.ok) {
    const err = await readJson<{ error?: string; message?: string }>(res).catch(() => ({}));
    throw new Error(translateApiError(err.error ?? err.message ?? 'Kunde inte skicka e-post'));
  }

  return readJson<TransferNotifyResponse>(res);
}

export async function getTransfer(token: string, password?: string): Promise<TransferPublic> {
  const params = password ? `?password=${encodeURIComponent(password)}` : '';
  const res = await fetch(`${base}/api/transfers/${token}${params}`);

  if (!res.ok) {
    const err = await readJson<{ error?: string; message?: string }>(res).catch(() => ({}));
    throw new Error(translateApiError(err.error ?? 'Kunde inte ladda överföringen'));
  }

  return readJson<TransferPublic>(res);
}

export async function submitSupport(body: SupportRequest): Promise<SupportRequestResponse> {
  const res = await fetch(`${base}/api/support`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await readJson<{ error?: string; message?: string }>(res).catch(() => ({}));
    throw new Error(translateApiError(err.error ?? 'Kunde inte skicka supportförfrågan'));
  }

  return readJson<SupportRequestResponse>(res);
}

export async function registerUser(body: RegisterRequest): Promise<AuthUser> {
  const res = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await readJson<{ error?: string; message?: string }>(res).catch(() => ({}));
    throw new Error(err.error ?? 'Registreringen misslyckades');
  }

  return readJson<AuthUser>(res);
}

export function downloadUrl(fileId: string, password?: string): string {
  const params = password ? `?password=${encodeURIComponent(password)}` : '';
  return `${base}/api/downloads/${fileId}${params}`;
}
