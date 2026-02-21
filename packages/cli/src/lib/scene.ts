import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const sceneSchema = z.object({
  name: z.string(),
  compositionId: z.string(),
  render: z.object({
    fps: z.number().default(30),
    width: z.number().default(1920),
    height: z.number().default(1080),
    codec: z.enum(['h264', 'h265', 'vp8', 'vp9']).default('h264'),
    crf: z.number().default(18),
  }),
  props: z.record(z.unknown()).default({}),
});

export type SceneConfig = z.infer<typeof sceneSchema>;

export async function loadScene(dir: string = '.'): Promise<SceneConfig> {
  const filePath = resolve(dir, 'animate.json');
  const raw = await readFile(filePath, 'utf-8');
  return sceneSchema.parse(JSON.parse(raw));
}
