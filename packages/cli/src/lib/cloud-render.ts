import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { execSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import type { HttpClient } from './http';
import type { SceneConfig } from './scene';

interface RenderJob {
  job_id: string;
}

interface RenderStatus {
  status: 'queued' | 'rendering' | 'done' | 'error';
  progress: number;
  output_url?: string;
  error?: string;
}

interface UploadResult {
  storageKey: string;
}

/**
 * Bundle the project with Remotion, tar it, and upload to the API.
 * Returns the S3 storage key for the tarball.
 */
async function bundleAndUpload(client: HttpClient): Promise<string> {
  const tempDir = await mkdtemp(join(tmpdir(), 'oanim-bundle-'));
  const bundleDir = join(tempDir, 'bundle');
  const tarballPath = join(tempDir, 'bundle.tar.gz');

  try {
    // Run Remotion bundle
    execSync(`npx remotion bundle --out-dir ${bundleDir}`, {
      stdio: 'pipe',
      cwd: process.cwd(),
      timeout: 120_000,
    });

    // Create tarball from the bundle output
    execSync(`tar -czf ${tarballPath} -C ${bundleDir} .`, {
      stdio: 'pipe',
      timeout: 30_000,
    });

    // Read tarball and upload
    const tarballBuffer = await readFile(tarballPath);
    const blob = new Blob([tarballBuffer], { type: 'application/gzip' });
    const result = await client.uploadBlob<UploadResult>('/api/v1/render/upload', blob);

    return result.storageKey;
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function submitCloudRender(
  client: HttpClient,
  config: SceneConfig,
): Promise<string> {
  // Bundle the project locally with Remotion, then upload
  const storageKey = await bundleAndUpload(client);

  const job = await client.request<RenderJob>('POST', '/api/v1/render', {
    body: {
      config,
      storageKey,
    },
  });

  return job.job_id;
}

export async function pollRenderStatus(
  client: HttpClient,
  jobId: string,
): Promise<RenderStatus> {
  return client.request<RenderStatus>('GET', `/api/v1/render/${jobId}`);
}

export async function downloadRenderOutput(
  client: HttpClient,
  jobId: string,
  outPath: string,
): Promise<void> {
  const status = await pollRenderStatus(client, jobId);
  if (!status.output_url) {
    throw new Error('Render output not available');
  }

  const res = await fetch(status.output_url);
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download render output: ${res.status}`);
  }

  const { mkdir } = await import('node:fs/promises');
  const { dirname } = await import('node:path');
  await mkdir(dirname(outPath), { recursive: true });

  const writer = createWriteStream(outPath);
  await pipeline(Readable.fromWeb(res.body as import('node:stream/web').ReadableStream), writer);
}

export async function waitForRender(
  client: HttpClient,
  jobId: string,
  onProgress?: (progress: number) => void,
): Promise<RenderStatus> {
  while (true) {
    const status = await pollRenderStatus(client, jobId);

    if (onProgress) onProgress(status.progress);

    if (status.status === 'done') return status;
    if (status.status === 'error') {
      throw new Error(`Cloud render failed: ${status.error ?? 'unknown error'}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
