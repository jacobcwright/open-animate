export interface GenerateOpts {
  imageSize?: string;
  numImages?: number;
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
  editImage(imageUrl: string, prompt: string): Promise<MediaResult>;
  removeBackground(imageUrl: string): Promise<MediaResult>;
  upscale(imageUrl: string, scale?: number): Promise<MediaResult>;
  run(model: string, input: Record<string, unknown>): Promise<RunResult>;
}
