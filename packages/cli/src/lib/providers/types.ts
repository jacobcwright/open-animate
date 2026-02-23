export interface GenerateOpts {
  imageSize?: string;
  numImages?: number;
  model?: string;
}

export interface MediaResult {
  url: string;
  provider: string;
  model: string;
  estimatedCostUsd: number;
}

export interface RunResult {
  url: string | null;
  result: unknown;
  provider: string;
  model: string;
  estimatedCostUsd: number;
}

export interface MediaProvider {
  name: string;
  generateImage(prompt: string, opts?: GenerateOpts): Promise<MediaResult>;
  editImage(imageUrl: string, prompt: string, model?: string): Promise<MediaResult>;
  removeBackground(imageUrl: string, model?: string): Promise<MediaResult>;
  upscale(imageUrl: string, scale?: number, model?: string): Promise<MediaResult>;
  run(model: string, input: Record<string, unknown>): Promise<RunResult>;
}
