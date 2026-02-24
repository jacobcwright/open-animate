import type { MediaProvider, MediaResult, RunResult, GenerateOpts } from './types';
import { getModelCost } from '../costs';

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
      estimatedCostUsd: getModelCost(model),
    };
  }

  async generateImage(prompt: string, opts?: GenerateOpts): Promise<MediaResult> {
    const model = opts?.model ?? 'fal-ai/flux/schnell';
    const result = await this.request(model, {
      prompt,
      image_size: opts?.imageSize ?? 'landscape_16_9',
      num_images: opts?.numImages ?? 1,
    });
    const url = getMediaUrl(result);
    if (!url) throw new Error('Unexpected fal.ai response: no image URL found');
    return this.makeResult(model, url);
  }

  async editImage(imageUrl: string, prompt: string, model?: string): Promise<MediaResult> {
    model = model ?? 'fal-ai/flux/dev/image-to-image';
    const result = await this.request(model, {
      image_url: imageUrl,
      prompt,
      num_images: 1,
    });
    const url = getMediaUrl(result);
    if (!url) throw new Error('Unexpected fal.ai response: no image URL found');
    return this.makeResult(model, url);
  }

  async removeBackground(imageUrl: string, model?: string): Promise<MediaResult> {
    model = model ?? 'fal-ai/birefnet';
    const result = await this.request(model, {
      image_url: imageUrl,
    });
    const url = getMediaUrl(result);
    if (!url) throw new Error('Unexpected fal.ai response: no image URL found');
    return this.makeResult(model, url);
  }

  async upscale(imageUrl: string, scale = 2, model?: string): Promise<MediaResult> {
    model = model ?? 'fal-ai/creative-upscaler';
    const result = await this.request(model, {
      image_url: imageUrl,
      scale,
    });
    const url = getMediaUrl(result);
    if (!url) throw new Error('Unexpected fal.ai response: no image URL found');
    return this.makeResult(model, url);
  }

  async run(model: string, input: Record<string, unknown>): Promise<RunResult> {
    const result = await this.request(model, input);
    return {
      url: getMediaUrl(result),
      result,
      provider: this.name,
      model,
      estimatedCostUsd: getModelCost(model),
    };
  }
}
