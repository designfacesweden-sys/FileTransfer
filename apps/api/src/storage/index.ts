import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config.js';

let s3: S3Client | null = null;

function r2Endpoint(): string {
  if (config.r2.endpoint) return config.r2.endpoint;
  if (config.r2.accountId) {
    return `https://${config.r2.accountId}.r2.cloudflarestorage.com`;
  }
  throw new Error('R2_ENDPOINT or R2_ACCOUNT_ID is required when STORAGE_DRIVER=r2');
}

function getS3(): S3Client {
  if (!s3) {
    s3 = new S3Client({
      region: 'auto',
      endpoint: r2Endpoint(),
      credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey
      },
      forcePathStyle: true
    });
  }
  return s3;
}

export async function getDownloadUrl(storageKey: string, filename: string): Promise<string> {
  if (config.storageDriver === 'local') {
    return `${config.apiPublicUrl}/api/files/${encodeURIComponent(storageKey)}/download?name=${encodeURIComponent(filename)}`;
  }

  const command = new GetObjectCommand({
    Bucket: config.r2.bucket,
    Key: storageKey,
    ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, '')}"`
  });

  return getSignedUrl(getS3(), command, { expiresIn: 60 * 15 });
}
