import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { db, users, usageRecords } from '../db/index.js';
import { requireAuth, type AuthUser } from '../lib/auth.js';
import { getModelCost } from '../lib/costs.js';

const media = new Hono<{ Variables: { user: AuthUser } }>();

media.use('*', requireAuth);

// -- fal.ai helpers --

interface FalResult {
  images?: Array<{ url: string }>;
  image?: { url: string };
  [key: string]: unknown;
}

function getImageUrl(result: FalResult): string | null {
  if (result.images?.[0]?.url) return result.images[0].url;
  if (result.image?.url) return result.image.url;
  return null;
}

function getFalKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error('FAL_KEY not configured on server');
  return key;
}

async function falRequest(model: string, input: Record<string, unknown>): Promise<FalResult> {
  const res = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${getFalKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal.ai error (${res.status}): ${text}`);
  }

  return res.json() as Promise<FalResult>;
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

  const url = getImageUrl(result);
  return c.json({
    url,
    result,
    provider: 'fal.ai',
    model,
    estimatedCostUsd: cost,
  });
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

  const url = getImageUrl(result);
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

  const url = getImageUrl(result);
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

  const url = getImageUrl(result);
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

  const url = getImageUrl(result);
  if (!url) throw new Error('Unexpected fal.ai response: no image URL found');
  await trackUsage(user.id, 'fal.ai', model, 'upscale', getModelCost(model));
  return c.json(makeResponse(model, url));
});

export { media as mediaRoutes };
