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

  async editImage(imageUrl: string, prompt: string): Promise<MediaResult> {
    const res = await this.client.request<PlatformMediaResponse>(
      'POST',
      '/api/v1/media/edit',
      { body: { imageUrl, prompt } },
    );
    return this.toResult(res);
  }

  async removeBackground(imageUrl: string): Promise<MediaResult> {
    const res = await this.client.request<PlatformMediaResponse>(
      'POST',
      '/api/v1/media/remove-background',
      { body: { imageUrl } },
    );
    return this.toResult(res);
  }

  async upscale(imageUrl: string, scale = 2): Promise<MediaResult> {
    const res = await this.client.request<PlatformMediaResponse>(
      'POST',
      '/api/v1/media/upscale',
      { body: { imageUrl, scale } },
    );
    return this.toResult(res);
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
