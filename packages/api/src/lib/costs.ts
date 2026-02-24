/**
 * fal.ai base model costs (USD per run).
 * Platform margin is applied in getModelCost().
 */
export const PLATFORM_MARGIN = 0.4; // 40%

export const FAL_MODEL_COSTS: Record<string, number> = {
  // Image generation
  'fal-ai/flux/schnell': 0.003,
  'fal-ai/flux/dev': 0.025,
  'fal-ai/flux-pro/v1.1': 0.04,
  'fal-ai/flux-pro/v1.1-ultra': 0.06,
  'fal-ai/flux-realism': 0.025,
  'fal-ai/stable-diffusion-v35-large': 0.035,
  'fal-ai/stable-diffusion-v35-medium': 0.02,
  'fal-ai/recraft-v3': 0.04,
  'fal-ai/ideogram/v2': 0.08,
  'fal-ai/aura-flow': 0.01,

  // Image editing / manipulation
  'fal-ai/flux/dev/image-to-image': 0.025,
  'fal-ai/flux-pro/v1/fill': 0.05,
  'fal-ai/flux/dev/inpainting': 0.03,

  // Background removal / segmentation
  'fal-ai/birefnet': 0.005,
  'fal-ai/imageutils/rembg': 0.005,

  // Upscaling / enhancement
  'fal-ai/creative-upscaler': 0.025,
  'fal-ai/clarity-upscaler': 0.025,

  // Video generation (per-second models use 5s default)
  'fal-ai/kling-video/v1/standard/text-to-video': 0.225, // $0.045/sec × 5s
  'fal-ai/kling-video/v1/pro/text-to-video': 0.50, // $0.10/sec × 5s
  'fal-ai/kling-video/v1.5/pro/text-to-video': 0.50, // $0.10/sec × 5s
  'fal-ai/minimax-video/video-01-live': 0.50, // flat per video
  'fal-ai/hunyuan-video': 0.40, // flat per video
  'fal-ai/luma-dream-machine': 0.50, // flat per video (v1.5)
  'fal-ai/runway-gen3/turbo/image-to-video': 0.25, // may be discontinued
  'fal-ai/veo2': 2.50, // $0.50/sec × 5s

  // Audio / music
  'fal-ai/stable-audio': 0.0, // free on fal.ai

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
