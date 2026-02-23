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
    const res = await this.client.request<PlatformRunResponse>(
      'POST',
      '/api/v1/media/run',
      { body: { model, input } },
    );
    if (!res.url) throw new Error(`Model ${model} did not return an image URL`);
    return { url: res.url, provider: res.provider, model: res.model, estimatedCostUsd: res.estimatedCostUsd };
  }

  async run(model: string, input: Record<string, unknown>): Promise<RunResult> {
    const res = await this.client.request<PlatformRunResponse>(
      'POST',
      '/api/v1/media/run',
      { body: { model, input } },
    );
    return {
      url: res.url,
      result: res.result,
      provider: res.provider,
      model: res.model,
      estimatedCostUsd: res.estimatedCostUsd,
    };
  }
}
