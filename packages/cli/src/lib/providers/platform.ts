import type { MediaProvider, MediaResult, RunResult, GenerateOpts } from './types';
import { HttpClient } from '../http';

interface PlatformMediaResponse {
  url: string;
  provider: string;
  model: string;
  estimatedCostUsd: number;
}

interface PlatformRunResponse {
  url: string | null;
  result: unknown;
  provider: string;
  model: string;
  estimatedCostUsd: number;
}

interface PlatformSubmitResponse {
  requestId: string;
  statusUrl?: string;
  responseUrl?: string;
  model: string;
  provider: string;
  estimatedCostUsd: number;
}

interface PlatformStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED';
  queuePosition?: number | null;
  url?: string | null;
  result?: unknown;
  provider: string;
  model: string;
  estimatedCostUsd?: number;
}

/** Max time to wait for a queue job before giving up (10 minutes). */
const QUEUE_TIMEOUT_MS = 10 * 60 * 1000;

/** Initial poll interval (2 seconds). */
const POLL_INITIAL_MS = 2000;

/** Maximum poll interval (10 seconds). */
const POLL_MAX_MS = 10000;

/** Factor to increase poll interval each iteration. */
const POLL_BACKOFF = 1.5;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PlatformProvider implements MediaProvider {
  name = 'oanim';
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  private toResult(res: PlatformMediaResponse): MediaResult {
    return {
      url: res.url,
      provider: res.provider,
      model: res.model,
      estimatedCostUsd: res.estimatedCostUsd,
    };
  }

  /**
   * Submit a job to the queue and poll until completion.
   * Falls back to synchronous /run if the API doesn't support /submit (404).
   */
  private async submitAndPoll(
    model: string,
    input: Record<string, unknown>,
  ): Promise<PlatformStatusResponse> {
    // Try queue-based submit+poll first
    let submit: PlatformSubmitResponse;
    try {
      submit = await this.client.request<PlatformSubmitResponse>(
        'POST',
        '/api/v1/media/submit',
        { body: { model, input } },
      );
    } catch (err: unknown) {
      // Fall back to synchronous /run if /submit doesn't exist (old API)
      if (err instanceof Error && err.message.includes('404')) {
        const res = await this.client.request<PlatformRunResponse>(
          'POST',
          '/api/v1/media/run',
          { body: { model, input } },
        );
        return {
          status: 'COMPLETED',
          url: res.url,
          result: res.result,
          provider: res.provider,
          model: res.model,
          estimatedCostUsd: res.estimatedCostUsd,
        };
      }
      throw err;
    }

    // Poll for completion — pass fal.ai-provided URLs for reliable status checks
    const deadline = Date.now() + QUEUE_TIMEOUT_MS;
    let interval = POLL_INITIAL_MS;
    const statusParams = new URLSearchParams({ model });
    if (submit.statusUrl) statusParams.set('statusUrl', submit.statusUrl);
    if (submit.responseUrl) statusParams.set('responseUrl', submit.responseUrl);

    while (Date.now() < deadline) {
      await sleep(interval);

      const status = await this.client.request<PlatformStatusResponse>(
        'GET',
        `/api/v1/media/status/${submit.requestId}?${statusParams.toString()}`,
      );

      if (status.status === 'COMPLETED') {
        return {
          ...status,
          estimatedCostUsd: status.estimatedCostUsd ?? submit.estimatedCostUsd,
        };
      }

      interval = Math.min(interval * POLL_BACKOFF, POLL_MAX_MS);
    }

    throw new Error(
      `Queue timeout: model ${model} did not complete within ${QUEUE_TIMEOUT_MS / 1000}s. ` +
        `Request ID: ${submit.requestId}`,
    );
  }

  async generateImage(prompt: string, opts?: GenerateOpts): Promise<MediaResult> {
    if (opts?.model) {
      return this.runAsMediaResult(opts.model, {
        prompt,
        image_size: opts?.imageSize ?? 'landscape_16_9',
        num_images: opts?.numImages ?? 1,
      });
    }
    const res = await this.client.request<PlatformMediaResponse>(
      'POST',
      '/api/v1/media/generate',
      {
        body: {
          prompt,
          imageSize: opts?.imageSize ?? 'landscape_16_9',
          numImages: opts?.numImages ?? 1,
        },
      },
    );
    return this.toResult(res);
  }

  async editImage(imageUrl: string, prompt: string, model?: string): Promise<MediaResult> {
    if (model) {
      return this.runAsMediaResult(model, { image_url: imageUrl, prompt, num_images: 1 });
    }
    const res = await this.client.request<PlatformMediaResponse>(
      'POST',
      '/api/v1/media/edit',
      { body: { imageUrl, prompt } },
    );
    return this.toResult(res);
  }

  async removeBackground(imageUrl: string, model?: string): Promise<MediaResult> {
    if (model) {
      return this.runAsMediaResult(model, { image_url: imageUrl });
    }
    const res = await this.client.request<PlatformMediaResponse>(
      'POST',
      '/api/v1/media/remove-background',
      { body: { imageUrl } },
    );
    return this.toResult(res);
  }

  async upscale(imageUrl: string, scale = 2, model?: string): Promise<MediaResult> {
    if (model) {
      return this.runAsMediaResult(model, { image_url: imageUrl, scale });
    }
    const res = await this.client.request<PlatformMediaResponse>(
      'POST',
      '/api/v1/media/upscale',
      { body: { imageUrl, scale } },
    );
    return this.toResult(res);
  }

  private async runAsMediaResult(
    model: string,
    input: Record<string, unknown>,
  ): Promise<MediaResult> {
    const res = await this.submitAndPoll(model, input);
    const url = res.url ?? null;
    if (!url) throw new Error(`Model ${model} did not return an image URL`);
    return {
      url,
      provider: res.provider,
      model: res.model,
      estimatedCostUsd: res.estimatedCostUsd ?? 0,
    };
  }

  async run(model: string, input: Record<string, unknown>): Promise<RunResult> {
    const res = await this.submitAndPoll(model, input);
    return {
      url: res.url ?? null,
      result: res.result,
      provider: res.provider,
      model: res.model,
      estimatedCostUsd: res.estimatedCostUsd ?? 0,
    };
  }
}
