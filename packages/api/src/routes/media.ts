import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { db, users, usageRecords } from '../db/index.js';
import { requireAuth, type AuthUser } from '../lib/auth.js';
import { getModelCost } from '../lib/costs.js';
import { mediaRateLimit } from '../lib/rate-limit.js';

const media = new Hono<{ Variables: { user: AuthUser } }>();

media.use('*', requireAuth);
media.use('*', mediaRateLimit);

// -- fal.ai helpers --

interface FalResult {
  images?: Array<{ url: string }>;
  image?: { url: string };
  [key: string]: unknown;
}

function getMediaUrl(result: FalResult): string | null {
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

function getFalKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error('FAL_KEY not configured on server');
  return key;
}

function falHeaders(): Record<string, string> {
  return {
    Authorization: `Key ${getFalKey()}`,
    'Content-Type': 'application/json',
  };
}

async function falRequest(model: string, input: Record<string, unknown>): Promise<FalResult> {
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

// -- fal.ai queue helpers (for long-running models) --

interface FalQueueSubmitResponse {
  request_id: string;
}

interface FalQueueStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED';
  queue_position?: number;
  response_url?: string;
  logs?: Array<{ message: string; level: string; source: string; timestamp: string }>;
}

async function falQueueSubmit(model: string, input: Record<string, unknown>): Promise<string> {
  const res = await fetch(`https://queue.fal.run/${model}`, {
    method: 'POST',
    headers: falHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal.ai queue submit error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as FalQueueSubmitResponse;
  return data.request_id;
}

async function falQueueStatus(model: string, requestId: string): Promise<FalQueueStatusResponse> {
  const res = await fetch(
    `https://queue.fal.run/${model}/requests/${requestId}/status`,
    { headers: falHeaders() },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal.ai queue status error (${res.status}): ${text}`);
  }

  return (await res.json()) as FalQueueStatusResponse;
}

async function falQueueResult(model: string, requestId: string): Promise<FalResult> {
  const res = await fetch(
    `https://queue.fal.run/${model}/requests/${requestId}`,
    { headers: falHeaders() },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal.ai queue result error (${res.status}): ${text}`);
  }

  // fal.ai queue result returns the payload directly (same format as synchronous endpoint)
  return (await res.json()) as FalResult;
}

async function trackUsage(
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

function makeResponse(model: string, url: string) {
  return {
    url,
    provider: 'fal.ai',
    model,
    estimatedCostUsd: getModelCost(model),
  };
}

// -- Routes --

media.post('/run', async (c) => {
  const user = c.get('user');
  const { model, input } = await c.req.json<{
    model: string;
    input: Record<string, unknown>;
  }>();

  if (!model) return c.json({ error: 'Missing model' }, 400);
  if (!input) return c.json({ error: 'Missing input' }, 400);

  const result = await falRequest(model, input);
  const cost = getModelCost(model);
  await trackUsage(user.id, 'fal.ai', model, 'run', cost);

  const url = getMediaUrl(result);
  return c.json({
    url,
    result,
    provider: 'fal.ai',
    model,
    estimatedCostUsd: cost,
  });
});

// -- Queue-based endpoints (for long-running models like video/audio) --

media.post('/submit', async (c) => {
  const user = c.get('user');
  const { model, input } = await c.req.json<{
    model: string;
    input: Record<string, unknown>;
  }>();

  if (!model) return c.json({ error: 'Missing model' }, 400);
  if (!input) return c.json({ error: 'Missing input' }, 400);

  const requestId = await falQueueSubmit(model, input);

  // Track usage at submit time (deduct credits upfront)
  const cost = getModelCost(model);
  await trackUsage(user.id, 'fal.ai', model, 'run', cost);

  return c.json({
    requestId,
    model,
    provider: 'fal.ai',
    estimatedCostUsd: cost,
  });
});

media.get('/status/:requestId', async (c) => {
  const requestId = c.req.param('requestId');
  const model = c.req.query('model');

  if (!model) return c.json({ error: 'Missing model query parameter' }, 400);
  if (!requestId) return c.json({ error: 'Missing requestId' }, 400);

  try {
    const status = await falQueueStatus(model, requestId);

    if (status.status === 'COMPLETED') {
      const result = await falQueueResult(model, requestId);
      const url = getMediaUrl(result);
      return c.json({
        status: 'COMPLETED',
        url,
        result,
        provider: 'fal.ai',
        model,
        estimatedCostUsd: getModelCost(model),
      });
    }

    return c.json({
      status: status.status,
      queuePosition: status.queue_position ?? null,
      provider: 'fal.ai',
      model,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: message }, 500);
  }
});

media.post('/generate', async (c) => {
  const user = c.get('user');
  const { prompt, imageSize, numImages } = await c.req.json<{
    prompt: string;
    imageSize?: string;
    numImages?: number;
  }>();

  if (!prompt) return c.json({ error: 'Missing prompt' }, 400);

  const model = 'fal-ai/flux/schnell';
  const result = await falRequest(model, {
    prompt,
    image_size: imageSize ?? 'landscape_16_9',
    num_images: numImages ?? 1,
  });

  const url = getMediaUrl(result);
  if (!url) throw new Error('Unexpected fal.ai response: no image URL found');
  await trackUsage(user.id, 'fal.ai', model, 'generateImage', getModelCost(model));
  return c.json(makeResponse(model, url));
});

media.post('/edit', async (c) => {
  const user = c.get('user');
  const { imageUrl, prompt } = await c.req.json<{
    imageUrl: string;
    prompt: string;
  }>();

  if (!imageUrl || !prompt) return c.json({ error: 'Missing imageUrl or prompt' }, 400);

  const model = 'fal-ai/flux/dev/image-to-image';
  const result = await falRequest(model, {
    image_url: imageUrl,
    prompt,
    num_images: 1,
  });

  const url = getMediaUrl(result);
  if (!url) throw new Error('Unexpected fal.ai response: no image URL found');
  await trackUsage(user.id, 'fal.ai', model, 'editImage', getModelCost(model));
  return c.json(makeResponse(model, url));
});

media.post('/remove-background', async (c) => {
  const user = c.get('user');
  const { imageUrl } = await c.req.json<{ imageUrl: string }>();

  if (!imageUrl) return c.json({ error: 'Missing imageUrl' }, 400);

  const model = 'fal-ai/birefnet';
  const result = await falRequest(model, { image_url: imageUrl });

  const url = getMediaUrl(result);
  if (!url) throw new Error('Unexpected fal.ai response: no image URL found');
  await trackUsage(user.id, 'fal.ai', model, 'removeBackground', getModelCost(model));
  return c.json(makeResponse(model, url));
});

media.post('/upscale', async (c) => {
  const user = c.get('user');
  const { imageUrl, scale } = await c.req.json<{
    imageUrl: string;
    scale?: number;
  }>();

  if (!imageUrl) return c.json({ error: 'Missing imageUrl' }, 400);

  const model = 'fal-ai/creative-upscaler';
  const result = await falRequest(model, {
    image_url: imageUrl,
    scale: scale ?? 2,
  });

  const url = getMediaUrl(result);
  if (!url) throw new Error('Unexpected fal.ai response: no image URL found');
  await trackUsage(user.id, 'fal.ai', model, 'upscale', getModelCost(model));
  return c.json(makeResponse(model, url));
});

export { media as mediaRoutes };
