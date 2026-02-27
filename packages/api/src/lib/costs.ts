/**
 * fal.ai base model costs (USD per run).
 * Platform margin is applied in getModelCost().
 */
export const PLATFORM_MARGIN = 0.4; // 40%

export const FAL_MODEL_COSTS: Record<string, number> = {
  // Image generation
  'fal-ai/flux/schnell': 0.003,
  'fal-ai/flux-2-flex': 0.05,
  'fal-ai/recraft/v4/text-to-image': 0.04,
  'fal-ai/recraft/v4/pro/text-to-image': 0.06,
  'fal-ai/ideogram/v3': 0.06, // balanced tier
  'fal-ai/nano-banana-2': 0.08,

  // Image editing / manipulation
  'fal-ai/flux-pro/kontext': 0.04,
  'fal-ai/nano-banana-2/edit': 0.08,
  'fal-ai/reve/edit': 0.04,

  // Background removal / segmentation
  'fal-ai/birefnet': 0.005,
  'fal-ai/bria/background/remove': 0.018,

  // Upscaling / enhancement
  'fal-ai/bria/upscale/creative': 0.03,
  'fal-ai/topaz/upscale/image': 0.08, // up to 24MP

  // Video generation (per-second models use 5s default)
  'fal-ai/minimax/hailuo-02/standard/text-to-video': 0.27, // $0.045/sec × 6s
  'fal-ai/kling-video/v2.5-turbo/pro/text-to-video': 0.35, // $0.07/sec × 5s
  'fal-ai/kling-video/v3/pro/text-to-video': 1.12, // $0.224/sec × 5s
  'fal-ai/veo3.1': 1.00, // $0.20/sec × 5s (no audio, 1080p)
  'fal-ai/sora-2/text-to-video/pro': 1.50, // $0.30/sec × 5s (720p)

  // Audio / music / speech
  'beatoven/music-generation': 0.05,
  'beatoven/sound-effect-generation': 0.05,
  'minimax/speech-02-hd': 0.05,

  // ControlNet / IP-Adapter
  'fal-ai/flux/dev/controlnet': 0.03,
  'fal-ai/flux/dev/ip-adapter': 0.03,

  // Third-party models hosted on fal
  'fal-ai/lora': 0.02,
};

export const DEFAULT_COST = 0.05;

export function getModelCost(model: string): number {
  const base = FAL_MODEL_COSTS[model] ?? DEFAULT_COST;
  return base * (1 + PLATFORM_MARGIN);
}
