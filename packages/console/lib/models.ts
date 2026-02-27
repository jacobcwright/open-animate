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
  m('fal-ai/flux-2-flex', 'Flux 2 Flex', 0.05),
  m('fal-ai/recraft/v4/text-to-image', 'Recraft V4', 0.04),
  m('fal-ai/ideogram/v3', 'Ideogram V3', 0.06),
  m('fal-ai/nano-banana-2', 'Nano Banana 2', 0.08),
];

export const IMAGE_EDIT_MODELS: ModelDef[] = [
  m('fal-ai/flux-pro/kontext', 'Flux Kontext Pro', 0.04),
  m('fal-ai/nano-banana-2/edit', 'Nano Banana 2 Edit', 0.08),
  m('fal-ai/reve/edit', 'Reve Edit', 0.04),
];

export const BG_REMOVAL_MODELS: ModelDef[] = [
  m('fal-ai/birefnet', 'BiRefNet', 0.005),
  m('fal-ai/bria/background/remove', 'BRIA RMBG 2.0', 0.018),
];

export const UPSCALE_MODELS: ModelDef[] = [
  m('fal-ai/bria/upscale/creative', 'BRIA Creative', 0.03),
  m('fal-ai/topaz/upscale/image', 'Topaz Upscale', 0.08),
];

export const VIDEO_MODELS: ModelDef[] = [
  m('fal-ai/minimax/hailuo-02/standard/text-to-video', 'MiniMax Hailuo-02', 0.27),
  m('fal-ai/kling-video/v2.5-turbo/pro/text-to-video', 'Kling 2.5 Turbo Pro', 0.35),
  m('fal-ai/kling-video/v3/pro/text-to-video', 'Kling V3 Pro', 1.12),
  m('fal-ai/veo3.1', 'Veo 3.1', 1.00),
  m('fal-ai/sora-2/text-to-video/pro', 'Sora 2 Pro', 1.50),
];

export const AUDIO_MODELS: ModelDef[] = [
  m('beatoven/music-generation', 'Beatoven Music', 0.05),
  m('beatoven/sound-effect-generation', 'Beatoven SFX', 0.05),
  m('minimax/speech-02-hd', 'MiniMax Speech-02 HD', 0.05),
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
