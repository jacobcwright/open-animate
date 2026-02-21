import type { MediaProvider, MediaResult, GenerateOpts } from './types';

interface FalResult {
  images?: Array<{ url: string }>;
  image?: { url: string };
}

function getImageUrl(result: FalResult): string {
  if (result.images?.[0]?.url) return result.images[0].url;
  if (result.image?.url) return result.image.url;
  throw new Error('Unexpected fal.ai response: no image URL found');
}

const COST_ESTIMATES: Record<string, number> = {
  'fal-ai/flux/schnell': 0.003,
  'fal-ai/flux/dev/image-to-image': 0.025,
  'fal-ai/birefnet': 0.005,
  'fal-ai/creative-upscaler': 0.025,
};

export class FalProvider implements MediaProvider {
  name = 'fal.ai';

  private getApiKey(): string {
    const key = process.env.ANIMATE_FAL_KEY;
    if (!key) {
      throw new Error(
        'ANIMATE_FAL_KEY environment variable is required for asset generation.\n' +
          'Get a key at https://fal.ai/dashboard/keys',
      );
    }
    return key;
  }

  private async request(model: string, input: Record<string, unknown>): Promise<FalResult> {
    const key = this.getApiKey();
    const res = await fetch(`https://fal.run/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`fal.ai API error (${res.status}): ${text}`);
    }

    return res.json() as Promise<FalResult>;
  }

  private makeResult(model: string, url: string): MediaResult {
    return {
      url,
      provider: this.name,
      model,
      estimatedCostUsd: COST_ESTIMATES[model] ?? 0,
    };
  }

  async generateImage(prompt: string, opts?: GenerateOpts): Promise<MediaResult> {
    const model = 'fal-ai/flux/schnell';
    const result = await this.request(model, {
      prompt,
      image_size: opts?.imageSize ?? 'landscape_16_9',
      num_images: opts?.numImages ?? 1,
    });
    return this.makeResult(model, getImageUrl(result));
  }

  async editImage(imageUrl: string, prompt: string): Promise<MediaResult> {
    const model = 'fal-ai/flux/dev/image-to-image';
    const result = await this.request(model, {
      image_url: imageUrl,
      prompt,
      num_images: 1,
    });
    return this.makeResult(model, getImageUrl(result));
  }

  async removeBackground(imageUrl: string): Promise<MediaResult> {
    const model = 'fal-ai/birefnet';
    const result = await this.request(model, {
      image_url: imageUrl,
    });
    return this.makeResult(model, getImageUrl(result));
  }

  async upscale(imageUrl: string, scale = 2): Promise<MediaResult> {
    const model = 'fal-ai/creative-upscaler';
    const result = await this.request(model, {
      image_url: imageUrl,
      scale,
    });
    return this.makeResult(model, getImageUrl(result));
  }
}
