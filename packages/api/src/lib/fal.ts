import { eq, sql } from 'drizzle-orm';
import { db, users, usageRecords } from '../db/index.js';
import { getModelCost } from './costs.js';

// -- Types --

export interface FalResult {
  images?: Array<{ url: string }>;
  image?: { url: string };
  [key: string]: unknown;
}

export interface FalQueueSubmitResponse {
  request_id: string;
  status_url?: string;
  response_url?: string;
  cancel_url?: string;
}

export interface FalQueueStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED';
  queue_position?: number;
  response_url?: string;
  logs?: Array<{ message: string; level: string; source: string; timestamp: string }>;
}

// -- Helpers --

export function getFalKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error('FAL_KEY not configured on server');
  return key;
}

export function falAuthHeader(): Record<string, string> {
  return { Authorization: `Key ${getFalKey()}` };
}

export function falHeaders(): Record<string, string> {
  return {
    ...falAuthHeader(),
    'Content-Type': 'application/json',
  };
}

export function getMediaUrl(result: FalResult): string | null {
  if (result.images?.[0]?.url) return result.images[0].url;
  if (result.image?.url) return result.image.url;
  // Video models (kling, minimax, hunyuan)
  const video = result.video as { url?: string } | undefined;
  if (video?.url) return video.url;
  // Audio models (stable-audio)
  const audioFile = result.audio_file as { url?: string } | undefined;
  if (audioFile?.url) return audioFile.url;
  return null;
}

// -- API calls --

export async function falRequest(model: string, input: Record<string, unknown>): Promise<FalResult> {
  const res = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: falHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal.ai error (${res.status}): ${text}`);
  }

  return res.json() as Promise<FalResult>;
}

export async function falQueueSubmit(model: string, input: Record<string, unknown>): Promise<FalQueueSubmitResponse> {
  const res = await fetch(`https://queue.fal.run/${model}`, {
    method: 'POST',
    headers: falHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal.ai queue submit error (${res.status}): ${text}`);
  }

  return (await res.json()) as FalQueueSubmitResponse;
}

export async function falQueueStatus(statusUrl: string): Promise<FalQueueStatusResponse> {
  const res = await fetch(statusUrl, { headers: falAuthHeader() });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal.ai queue status error (${res.status}): ${text}`);
  }

  return (await res.json()) as FalQueueStatusResponse;
}

export async function falQueueResult(responseUrl: string): Promise<FalResult> {
  const res = await fetch(responseUrl, { headers: falAuthHeader() });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal.ai queue result error (${res.status}): ${text}`);
  }

  // Queue result may wrap output in a `response` key
  const data = (await res.json()) as { response?: FalResult } & FalResult;
  return data.response ?? data;
}

// -- Usage tracking --

export async function trackUsage(
  userId: string,
  provider: string,
  model: string,
  operation: string,
  cost: number,
): Promise<void> {
  await db.insert(usageRecords).values({
    userId,
    provider,
    model,
    operation,
    estimatedCostUsd: String(cost),
  });
  await db
    .update(users)
    .set({
      creditBalanceUsd: sql`GREATEST(${users.creditBalanceUsd} - ${String(cost)}, 0)`,
    })
    .where(eq(users.id, userId));
}

export function makeResponse(model: string, url: string) {
  return {
    url,
    provider: 'fal.ai',
    model,
    estimatedCostUsd: getModelCost(model),
  };
}

// -- Submit and poll (for long-running models) --

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function submitAndPoll(
  model: string,
  input: Record<string, unknown>,
  userId: string,
): Promise<{ url: string | null; result: FalResult; estimatedCostUsd: number }> {
  const submit = await falQueueSubmit(model, input);
  const cost = getModelCost(model);
  await trackUsage(userId, 'fal.ai', model, 'run', cost);

  const statusUrl = submit.status_url ?? `https://queue.fal.run/${model}/requests/${submit.request_id}/status`;
  const responseUrl = submit.response_url ?? `https://queue.fal.run/${model}/requests/${submit.request_id}`;

  // Exponential backoff: 2s initial, 1.5x multiplier, 10s max, 10min timeout
  let delay = 2000;
  const maxDelay = 10000;
  const multiplier = 1.5;
  const timeout = 10 * 60 * 1000;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    await sleep(delay);
    const status = await falQueueStatus(statusUrl);

    if (status.status === 'COMPLETED') {
      const result = await falQueueResult(responseUrl);
      const url = getMediaUrl(result);
      return { url, result, estimatedCostUsd: cost };
    }

    delay = Math.min(delay * multiplier, maxDelay);
  }

  throw new Error(`fal.ai queue timed out after 10 minutes for model ${model}`);
}
