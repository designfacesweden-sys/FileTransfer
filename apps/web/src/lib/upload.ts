import * as tus from 'tus-js-client';
import type { CreateTransferResponse } from '@filetransfer/shared';

export interface UploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
}

export function uploadFile(
  file: File,
  transfer: CreateTransferResponse,
  onProgress: (p: UploadProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: transfer.uploadUrl,
      retryDelays: [0, 1000, 3000, 5000],
      chunkSize: 6 * 1024 * 1024,
      removeFingerprintOnSuccess: true,
      metadata: {
        transferId: transfer.transferId,
        filename: file.name,
        filetype: file.type || 'application/octet-stream'
      },
      onError: reject,
      onProgress: (bytesUploaded, bytesTotal) => {
        onProgress({
          bytesUploaded,
          bytesTotal,
          percentage: bytesTotal ? Math.round((bytesUploaded / bytesTotal) * 100) : 0
        });
      },
      onSuccess: () => resolve()
    });

    upload
      .findPreviousUploads()
      .then((previous) => {
        const match = previous.find((entry) => entry.metadata?.transferId === transfer.transferId);
        if (match) upload.resumeFromPreviousUpload(match);
        upload.start();
      })
      .catch(reject);
  });
}
