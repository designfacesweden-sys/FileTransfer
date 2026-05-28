import { mkdirSync } from 'node:fs';
import { FileStore } from '@tus/file-store';
import { S3Store } from '@tus/s3-store';
import { Server } from '@tus/server';
import { config } from '../config.js';
import { pool } from '../db/index.js';

mkdirSync(config.localStoragePath, { recursive: true });

function r2Endpoint(): string {
  if (config.r2.endpoint) return config.r2.endpoint;
  if (config.r2.accountId) {
    return `https://${config.r2.accountId}.r2.cloudflarestorage.com`;
  }
  throw new Error('R2_ENDPOINT or R2_ACCOUNT_ID is required when STORAGE_DRIVER=r2');
}

function createStore() {
  if (config.storageDriver === 'r2') {
    return new S3Store({
      partSize: 8 * 1024 * 1024,
      s3ClientConfig: {
        bucket: config.r2.bucket,
        region: 'auto',
        endpoint: r2Endpoint(),
        credentials: {
          accessKeyId: config.r2.accessKeyId,
          secretAccessKey: config.r2.secretAccessKey
        },
        forcePathStyle: true
      }
    });
  }

  return new FileStore({ directory: config.localStoragePath });
}

export const tusServer = new Server({
  path: '/api/uploads',
  datastore: createStore(),
  async onUploadFinish(req, upload) {
    const transferId = upload.metadata?.transferId;
    const filename = upload.metadata?.filename ?? 'file';
    const mimeType = upload.metadata?.filetype ?? null;

    if (!transferId) {
      console.error('[TUS] Missing transferId in upload metadata', upload.metadata);
      throw new Error('Missing transferId in upload metadata');
    }

    const storageKey = upload.id;

    try {
      await pool.query(
        `INSERT INTO files (transfer_id, tus_id, name, size, mime_type, storage_key)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [transferId, upload.id, filename, upload.size ?? 0, mimeType, storageKey]
      );
      console.log(`[TUS] Saved file "${filename}" (${upload.size ?? 0} bytes) for transfer ${transferId}`);
    } catch (err) {
      console.error('[TUS] Failed to record file in database:', err);
      throw err;
    }

    return { status_code: 204 };
  }
});
