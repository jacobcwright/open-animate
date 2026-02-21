import { readFile, writeFile } from 'node:fs/promises';
import type { MediaProvider, MediaResult, GenerateOpts } from './providers/types';
import { FalProvider } from './providers/fal';

export interface UsageRecord {
  provider: string;
  model: string;
  operation: string;
  estimatedCostUsd: number;
  timestamp: Date;
}

export class MediaGateway {
  private provider: MediaProvider;
  private usage: UsageRecord[] = [];
  private costLimitUsd: number | null;

  constructor(provider?: MediaProvider) {
    this.provider = provider ?? new FalProvider();
    const limit = process.env.ANIMATE_MAX_USD_PER_RUN;
    this.costLimitUsd = limit ? parseFloat(limit) : null;
  }

  get totalCostUsd(): number {
    return this.usage.reduce((sum, r) => sum + r.estimatedCostUsd, 0);
  }

  get usageRecords(): readonly UsageRecord[] {
    return this.usage;
  }

  private checkCostLimit(estimatedCost: number): void {
    if (this.costLimitUsd === null) return;
    const projected = this.totalCostUsd + estimatedCost;
    if (projected > this.costLimitUsd) {
      throw new Error(
        `Cost limit exceeded: $${projected.toFixed(4)} would exceed ` +
          `ANIMATE_MAX_USD_PER_RUN=$${this.costLimitUsd.toFixed(4)}. ` +
          `Session total so far: $${this.totalCostUsd.toFixed(4)}.`,
      );
    }
  }

  private track(result: MediaResult, operation: string): void {
    this.usage.push({
      provider: result.provider,
      model: result.model,
      operation,
      estimatedCostUsd: result.estimatedCostUsd,
      timestamp: new Date(),
    });
  }

  private async downloadToFile(url: string, outPath: string): Promise<void> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(outPath, buffer);
  }

  private async fileToDataUrl(inputPath: string): Promise<string> {
    const data = await readFile(inputPath);
    const ext = inputPath.split('.').pop() ?? 'png';
    return `data:image/${ext};base64,${data.toString('base64')}`;
  }

  async generateImage(prompt: string, outPath: string, opts?: GenerateOpts): Promise<void> {
    this.checkCostLimit(0.003);
    const result = await this.provider.generateImage(prompt, opts);
    this.track(result, 'generateImage');
    await this.downloadToFile(result.url, outPath);
  }

  async editImage(inputPath: string, prompt: string, outPath: string): Promise<void> {
    this.checkCostLimit(0.025);
    const imageUrl = await this.fileToDataUrl(inputPath);
    const result = await this.provider.editImage(imageUrl, prompt);
    this.track(result, 'editImage');
    await this.downloadToFile(result.url, outPath);
  }

  async removeBackground(inputPath: string, outPath: string): Promise<void> {
    this.checkCostLimit(0.005);
    const imageUrl = await this.fileToDataUrl(inputPath);
    const result = await this.provider.removeBackground(imageUrl);
    this.track(result, 'removeBackground');
    await this.downloadToFile(result.url, outPath);
  }

  async upscaleImage(inputPath: string, outPath: string): Promise<void> {
    this.checkCostLimit(0.025);
    const imageUrl = await this.fileToDataUrl(inputPath);
    const result = await this.provider.upscale(imageUrl, 2);
    this.track(result, 'upscale');
    await this.downloadToFile(result.url, outPath);
  }
}
