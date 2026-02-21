import { createReadStream, createWriteStream } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import type { HttpClient } from './http';
import type { SceneConfig } from './scene';

const IGNORE_DIRS = new Set(['node_modules', '.git', 'out', 'dist', '.next']);

interface RenderJob {
  job_id: string;
}

interface RenderStatus {
  status: 'queued' | 'rendering' | 'done' | 'error';
  progress: number;
  output_url?: string;
  error?: string;
}

async function collectFiles(dir: string, base: string = dir): Promise<Array<{ path: string; fullPath: string }>> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: Array<{ path: string; fullPath: string }> = [];

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, base)));
    } else {
      files.push({ path: relative(base, fullPath), fullPath });
    }
  }

  return files;
}

async function createTarball(dir: string): Promise<Buffer> {
  const files = await collectFiles(dir);
  // Simple tar-like format: JSON manifest + base64 file contents
  // The backend will unpack this
  const manifest: Array<{ path: string; size: number; content: string }> = [];

  for (const file of files) {
    const stats = await stat(file.fullPath);
    const chunks: Buffer[] = [];
    const stream = createReadStream(file.fullPath);
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    const content = Buffer.concat(chunks).toString('base64');
    manifest.push({ path: file.path, size: stats.size, content });
  }

  return Buffer.from(JSON.stringify(manifest));
}

export async function submitCloudRender(
  client: HttpClient,
  config: SceneConfig,
): Promise<string> {
  const tarball = await createTarball(process.cwd());

  const job = await client.request<RenderJob>('POST', '/api/v1/render', {
    body: {
      config,
      project: tarball.toString('base64'),
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
