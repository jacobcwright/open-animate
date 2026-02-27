import { Hono } from 'hono';
import { requireAuth, type AuthUser } from '../lib/auth.js';
import { getModelCost } from '../lib/costs.js';
import { mediaRateLimit } from '../lib/rate-limit.js';
import {
  falRequest,
  falQueueSubmit,
  falQueueStatus,
  falQueueResult,
  getMediaUrl,
  trackUsage,
  makeResponse,
} from '../lib/fal.js';

const media = new Hono<{ Variables: { user: AuthUser } }>();

media.use('*', requireAuth);
media.use('*', mediaRateLimit);

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

  const submit = await falQueueSubmit(model, input);

  // Track usage at submit time (deduct credits upfront)
  const cost = getModelCost(model);
  await trackUsage(user.id, 'fal.ai', model, 'run', cost);

  return c.json({
    requestId: submit.request_id,
    statusUrl: submit.status_url,
    responseUrl: submit.response_url,
    model,
    provider: 'fal.ai',
    estimatedCostUsd: cost,
  });
});

media.get('/status/:requestId', async (c) => {
  const requestId = c.req.param('requestId');
  const model = c.req.query('model');
  const statusUrl = c.req.query('statusUrl');
  const responseUrl = c.req.query('responseUrl');

  if (!model) return c.json({ error: 'Missing model query parameter' }, 400);
  if (!requestId) return c.json({ error: 'Missing requestId' }, 400);

  // Use fal.ai-provided URLs if available, otherwise construct them
  const effectiveStatusUrl = statusUrl ?? `https://queue.fal.run/${model}/requests/${requestId}/status`;
  const effectiveResponseUrl = responseUrl ?? `https://queue.fal.run/${model}/requests/${requestId}`;

  try {
    const status = await falQueueStatus(effectiveStatusUrl);

    if (status.status === 'COMPLETED') {
      const result = await falQueueResult(effectiveResponseUrl);
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

  const model = 'fal-ai/flux-2-flex';
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

  const model = 'fal-ai/flux-pro/kontext';
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

  const model = 'fal-ai/bria/upscale/creative';
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
