/**
 * Model catalog for the Generate playground.
 * Costs = fal.ai base × 1.4 (40% platform margin), matching packages/api/src/lib/costs.ts
 */

const PLATFORM_MARGIN = 0.4;

export interface ModelDef {
  id: string;
  name: string;
  cost: number; // USD per run (with margin)
}

function m(id: string, name: string, baseCost: number): ModelDef {
  return { id, name, cost: baseCost * (1 + PLATFORM_MARGIN) };
}

export const IMAGE_GEN_MODELS: ModelDef[] = [
  m('fal-ai/flux/schnell', 'Flux Schnell', 0.003),
  m('fal-ai/flux/dev', 'Flux Dev', 0.025),
  m('fal-ai/flux-pro/v1.1', 'Flux Pro v1.1', 0.04),
  m('fal-ai/flux-pro/v1.1-ultra', 'Flux Pro Ultra', 0.06),
  m('fal-ai/flux-realism', 'Flux Realism', 0.025),
  m('fal-ai/stable-diffusion-v35-large', 'SD 3.5 Large', 0.035),
  m('fal-ai/recraft-v3', 'Recraft v3', 0.04),
  m('fal-ai/ideogram/v2', 'Ideogram v2', 0.08),
  m('fal-ai/aura-flow', 'AuraFlow', 0.01),
];

export const IMAGE_EDIT_MODELS: ModelDef[] = [
  m('fal-ai/flux/dev/image-to-image', 'Flux Dev img2img', 0.025),
  m('fal-ai/flux-pro/v1/fill', 'Flux Pro Fill', 0.05),
  m('fal-ai/flux/dev/inpainting', 'Flux Dev Inpainting', 0.03),
];

export const BG_REMOVAL_MODELS: ModelDef[] = [
  m('fal-ai/birefnet', 'BiRefNet', 0.005),
  m('fal-ai/imageutils/rembg', 'rembg', 0.005),
];

export const UPSCALE_MODELS: ModelDef[] = [
  m('fal-ai/creative-upscaler', 'Creative Upscaler', 0.025),
  m('fal-ai/clarity-upscaler', 'Clarity Upscaler', 0.025),
];

export const VIDEO_MODELS: ModelDef[] = [
  m('fal-ai/kling-video/v1/standard/text-to-video', 'Kling Standard', 0.225),
  m('fal-ai/kling-video/v1.5/pro/text-to-video', 'Kling v1.5 Pro', 0.50),
  m('fal-ai/minimax-video/video-01-live', 'Minimax Video', 0.50),
  m('fal-ai/hunyuan-video', 'Hunyuan Video', 0.40),
  m('fal-ai/luma-dream-machine', 'Luma Dream Machine', 0.50),
  m('fal-ai/veo2', 'Veo 2', 2.50),
];

export const AUDIO_MODELS: ModelDef[] = [
  m('fal-ai/stable-audio', 'Stable Audio', 0.0),
];

export const IMAGE_SIZES = [
  { value: 'square_hd', label: 'Square HD (1024×1024)' },
  { value: 'square', label: 'Square (512×512)' },
  { value: 'landscape_4_3', label: 'Landscape 4:3' },
  { value: 'landscape_16_9', label: 'Landscape 16:9' },
  { value: 'portrait_4_3', label: 'Portrait 4:3' },
  { value: 'portrait_16_9', label: 'Portrait 16:9' },
] as const;

export function formatModelCost(cost: number): string {
  if (cost === 0) return 'Free';
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(3)}`;
}
