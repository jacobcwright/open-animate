import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

function bucket(): string {
  return process.env.S3_BUCKET ?? 'oanim-renders';
}

export async function uploadToS3(key: string, body: Buffer | Uint8Array, contentType?: string): Promise<void> {
  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const s3 = getS3Client();
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket(), Key: key }),
    { expiresIn },
  );
}

export async function downloadFromS3(key: string): Promise<Buffer> {
  const s3 = getS3Client();
  const res = await s3.send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  const stream = res.Body as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function deleteFromS3(key: string): Promise<void> {
  const s3 = getS3Client();
  await s3.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

/**
 * Recursively upload a directory to S3 under a given prefix.
 */
export async function uploadDirToS3(localDir: string, s3Prefix: string): Promise<void> {
  const { readdir, readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');

  const entries = await readdir(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const localPath = join(localDir, entry.name);
    const s3Key = `${s3Prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      await uploadDirToS3(localPath, s3Key);
    } else {
      const content = await readFile(localPath);
      await uploadToS3(s3Key, content);
    }
  }
}
