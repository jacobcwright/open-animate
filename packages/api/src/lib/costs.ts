/**
 * fal.ai model cost estimates (USD per run).
 * Used for credit deduction and usage tracking.
 */
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

  // Video generation
  'fal-ai/kling-video/v1/standard/text-to-video': 0.1,
  'fal-ai/kling-video/v1/pro/text-to-video': 0.35,
  'fal-ai/kling-video/v1.5/pro/text-to-video': 0.35,
  'fal-ai/minimax-video/video-01-live': 0.3,
  'fal-ai/hunyuan-video': 0.5,
  'fal-ai/luma-dream-machine': 0.3,
  'fal-ai/runway-gen3/turbo/image-to-video': 0.25,
  'fal-ai/veo2': 0.5,

  // Audio / music
  'fal-ai/stable-audio': 0.04,

  // ControlNet / IP-Adapter
  'fal-ai/flux/dev/controlnet': 0.03,
  'fal-ai/flux/dev/ip-adapter': 0.03,

  // Third-party models hosted on fal
  'fal-ai/lora': 0.02,
};

export const DEFAULT_COST = 0.05;

export function getModelCost(model: string): number {
  return FAL_MODEL_COSTS[model] ?? DEFAULT_COST;
}
