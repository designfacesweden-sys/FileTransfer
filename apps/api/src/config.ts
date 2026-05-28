import { config as loadEnv } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveDatabaseUrl } from './db/connection.js';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
loadEnv({ path: resolve(apiRoot, '.env') });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';
const rawDatabaseUrl = required(
  'DATABASE_URL',
  'postgresql://filetransfer:filetransfer@localhost:5432/filetransfer'
);

export const config = {
  port: Number(process.env.API_PORT ?? 3001),
  databaseDriver: (process.env.DATABASE_DRIVER ??
    (isProduction ? 'postgres' : 'memory')) as 'memory' | 'postgres',
  databaseUrl: resolveDatabaseUrl(rawDatabaseUrl),
  apiPublicUrl: required('API_PUBLIC_URL', 'http://localhost:3001'),
  webPublicUrl: required('WEB_PUBLIC_URL', 'http://localhost:5173'),
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  storageDriver: (process.env.STORAGE_DRIVER ?? 'local') as 'local' | 'r2',
  localStoragePath: process.env.LOCAL_STORAGE_PATH ?? './data/uploads',
  r2: {
    accountId: process.env.R2_ACCOUNT_ID ?? '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    bucket: process.env.R2_BUCKET ?? '',
    endpoint: process.env.R2_ENDPOINT ?? '',
    publicUrl: process.env.R2_PUBLIC_URL ?? ''
  },
  supportInbox: process.env.SUPPORT_INBOX ?? 'support@keira.com',
  supportFromEmail: process.env.SUPPORT_FROM_EMAIL ?? 'Keira <onboarding@resend.dev>',
  transferFromEmail:
    process.env.TRANSFER_FROM_EMAIL ??
    process.env.SUPPORT_FROM_EMAIL ??
    'Keira <onboarding@resend.dev>',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  /** Resend account owner email — only recipient allowed in sandbox mode */
  resendAccountEmail: process.env.RESEND_ACCOUNT_EMAIL ?? process.env.SUPPORT_INBOX ?? '',
  /** Local dev: send all transfer emails here when sandbox blocks other recipients */
  resendDevRedirectTo: process.env.RESEND_DEV_REDIRECT_TO ?? '',
  supportWebhookUrl: process.env.SUPPORT_WEBHOOK_URL ?? ''
};
