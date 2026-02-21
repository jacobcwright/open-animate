import { writeFile } from 'node:fs/promises';

function getApiKey(): string {
  const key = process.env.ANIMATE_FAL_KEY;
  if (!key) {
    throw new Error(
      'ANIMATE_FAL_KEY environment variable is required for asset generation.\n' +
        'Get a key at https://fal.ai/dashboard/keys',
    );
  }
  return key;
}

interface FalResult {
  images?: Array<{ url: string }>;
  image?: { url: string };
}

function getImageUrl(result: FalResult): string {
  if (result.images?.[0]?.url) return result.images[0].url;
  if (result.image?.url) return result.image.url;
  throw new Error('Unexpected fal.ai response: no image URL found');
}

async function falRequest(
  model: string,
  input: Record<string, unknown>,
): Promise<FalResult> {
  const key = getApiKey();
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

async function downloadImage(url: string, outPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buffer);
}

export async function generateImage(
  prompt: string,
  outPath: string,
): Promise<void> {
  const result = await falRequest('fal-ai/flux/schnell', {
    prompt,
    image_size: 'landscape_16_9',
    num_images: 1,
  });
  await downloadImage(getImageUrl(result), outPath);
}

export async function editImage(
  inputPath: string,
  prompt: string,
  outPath: string,
): Promise<void> {
  const { readFile: readFileFs } = await import('node:fs/promises');
  const imageData = await readFileFs(inputPath);
  const base64 = imageData.toString('base64');
  const ext = inputPath.split('.').pop() ?? 'png';

  const result = await falRequest('fal-ai/flux/dev/image-to-image', {
    image_url: `data:image/${ext};base64,${base64}`,
    prompt,
    num_images: 1,
  });
  await downloadImage(getImageUrl(result), outPath);
}

export async function removeBackground(
  inputPath: string,
  outPath: string,
): Promise<void> {
  const { readFile: readFileFs } = await import('node:fs/promises');
  const imageData = await readFileFs(inputPath);
  const base64 = imageData.toString('base64');
  const ext = inputPath.split('.').pop() ?? 'png';

  const result = await falRequest('fal-ai/birefnet', {
    image_url: `data:image/${ext};base64,${base64}`,
  });
  await downloadImage(getImageUrl(result), outPath);
}

export async function upscaleImage(
  inputPath: string,
  outPath: string,
): Promise<void> {
  const { readFile: readFileFs } = await import('node:fs/promises');
  const imageData = await readFileFs(inputPath);
  const base64 = imageData.toString('base64');
  const ext = inputPath.split('.').pop() ?? 'png';

  const result = await falRequest('fal-ai/creative-upscaler', {
    image_url: `data:image/${ext};base64,${base64}`,
    scale: 2,
  });
  await downloadImage(getImageUrl(result), outPath);
}
