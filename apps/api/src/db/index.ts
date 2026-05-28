import { config } from '../config.js';
import { createPool } from './pool.js';

export const pool = createPool();

export async function verifyDatabaseConnection(): Promise<void> {
  if (config.databaseDriver === 'memory') return;

  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('[db] PostgreSQL connection OK');
  } finally {
    client.release();
  }
}

export interface TransferRow {
  id: string;
  token: string;
  title: string | null;
  message: string | null;
  plan: string;
  password_hash: string | null;
  recipient_email: string | null;
  sender_email: string | null;
  expires_at: Date;
  download_count: number;
  created_at: Date;
}

export interface FileRow {
  id: string;
  transfer_id: string;
  tus_id: string;
  name: string;
  size: string;
  mime_type: string | null;
  storage_key: string;
  created_at: Date;
}
