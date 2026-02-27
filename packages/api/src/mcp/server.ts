import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AuthUser } from '../lib/auth.js';
import { getModelCost } from '../lib/costs.js';
import {
  falRequest,
  getMediaUrl,
  trackUsage,
  submitAndPoll,
} from '../lib/fal.js';

/**
 * Create a stateless MCP server instance with all media tools registered.
 * A new server is created per request (stateless mode).
 */
export function createMcpServer(user: AuthUser): McpServer {
  const server = new McpServer({
    name: 'open-animate',
    version: '0.1.0',
  });

  // -- gen_image --
  server.tool(
    'gen_image',
    'Generate an image from a text prompt. Returns a URL to the generated image.',
    {
      prompt: z.string().describe('Text description of the image to generate'),
      model: z
        .string()
        .optional()
        .describe('fal.ai model ID (default: fal-ai/flux/schnell)'),
      image_size: z
        .string()
        .optional()
        .describe('Image size preset (default: landscape_16_9)'),
      num_images: z
        .number()
        .optional()
        .describe('Number of images to generate (default: 1)'),
    },
    async ({ prompt, model, image_size, num_images }) => {
      const m = model ?? 'fal-ai/flux/schnell';
      const result = await falRequest(m, {
        prompt,
        image_size: image_size ?? 'landscape_16_9',
        num_images: num_images ?? 1,
      });
      const url = getMediaUrl(result);
      const cost = getModelCost(m);
      await trackUsage(user.id, 'fal.ai', m, 'gen_image', cost);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ url, model: m, estimatedCostUsd: cost }),
          },
        ],
      };
    },
  );

  // -- edit_image --
  server.tool(
    'edit_image',
    'Edit an existing image with a text prompt. Returns a URL to the edited image.',
    {
      image_url: z.string().describe('URL of the image to edit'),
      prompt: z.string().describe('Text description of the edits to make'),
      model: z
        .string()
        .optional()
        .describe('fal.ai model ID (default: fal-ai/flux/dev/image-to-image)'),
    },
    async ({ image_url, prompt, model }) => {
      const m = model ?? 'fal-ai/flux/dev/image-to-image';
      const result = await falRequest(m, {
        image_url,
        prompt,
        num_images: 1,
      });
      const url = getMediaUrl(result);
      const cost = getModelCost(m);
      await trackUsage(user.id, 'fal.ai', m, 'edit_image', cost);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ url, model: m, estimatedCostUsd: cost }),
          },
        ],
      };
    },
  );

  // -- remove_bg --
  server.tool(
    'remove_bg',
    'Remove the background from an image. Returns a URL to the image with transparent background.',
    {
      image_url: z.string().describe('URL of the image to remove background from'),
      model: z
        .string()
        .optional()
        .describe('fal.ai model ID (default: fal-ai/birefnet)'),
    },
    async ({ image_url, model }) => {
      const m = model ?? 'fal-ai/birefnet';
      const result = await falRequest(m, { image_url });
      const url = getMediaUrl(result);
      const cost = getModelCost(m);
      await trackUsage(user.id, 'fal.ai', m, 'remove_bg', cost);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ url, model: m, estimatedCostUsd: cost }),
          },
        ],
      };
    },
  );

  // -- upscale --
  server.tool(
    'upscale',
    'Upscale an image to higher resolution. Returns a URL to the upscaled image.',
    {
      image_url: z.string().describe('URL of the image to upscale'),
      scale: z.number().optional().describe('Scale factor (default: 2)'),
      model: z
        .string()
        .optional()
        .describe('fal.ai model ID (default: fal-ai/creative-upscaler)'),
    },
    async ({ image_url, scale, model }) => {
      const m = model ?? 'fal-ai/creative-upscaler';
      const result = await falRequest(m, {
        image_url,
        scale: scale ?? 2,
      });
      const url = getMediaUrl(result);
      const cost = getModelCost(m);
      await trackUsage(user.id, 'fal.ai', m, 'upscale', cost);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ url, model: m, estimatedCostUsd: cost }),
          },
        ],
      };
    },
  );

  // -- gen_video --
  server.tool(
    'gen_video',
    'Generate a video from a text prompt. This is a long-running operation that polls until complete.',
    {
      prompt: z.string().describe('Text description of the video to generate'),
      model: z
        .string()
        .optional()
        .describe(
          'fal.ai model ID (default: fal-ai/kling-video/v1/standard/text-to-video)',
        ),
      duration: z
        .string()
        .optional()
        .describe('Video duration in seconds (default: "5")'),
    },
    async ({ prompt, model, duration }) => {
      const m = model ?? 'fal-ai/kling-video/v1/standard/text-to-video';
      const { url, estimatedCostUsd } = await submitAndPoll(
        m,
        { prompt, duration: duration ?? '5' },
        user.id,
      );
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ url, model: m, estimatedCostUsd }),
          },
        ],
      };
    },
  );

  // -- gen_audio --
  server.tool(
    'gen_audio',
    'Generate audio/music from a text prompt. This is a long-running operation that polls until complete.',
    {
      prompt: z.string().describe('Text description of the audio to generate'),
      model: z
        .string()
        .optional()
        .describe('fal.ai model ID (default: fal-ai/stable-audio)'),
      duration_in_seconds: z
        .number()
        .optional()
        .describe('Audio duration in seconds (default: 30)'),
    },
    async ({ prompt, model, duration_in_seconds }) => {
      const m = model ?? 'fal-ai/stable-audio';
      const { url, estimatedCostUsd } = await submitAndPoll(
        m,
        { prompt, duration_in_seconds: duration_in_seconds ?? 30 },
        user.id,
      );
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ url, model: m, estimatedCostUsd }),
          },
        ],
      };
    },
  );

  // -- run_model --
  server.tool(
    'run_model',
    'Run any fal.ai model with custom input. For short-running models, returns immediately. For long-running models (video, audio), set async=true to poll until complete.',
    {
      model: z.string().describe('fal.ai model ID (e.g. fal-ai/flux/schnell)'),
      input: z
        .record(z.unknown())
        .describe('Model input parameters as a JSON object'),
      async: z
        .boolean()
        .optional()
        .describe(
          'Use queue-based submit+poll for long-running models (default: false)',
        ),
    },
    async ({ model, input, async: useAsync }) => {
      if (useAsync) {
        const { url, result, estimatedCostUsd } = await submitAndPoll(
          model,
          input,
          user.id,
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ url, result, model, estimatedCostUsd }),
            },
          ],
        };
      }

      const result = await falRequest(model, input);
      const url = getMediaUrl(result);
      const cost = getModelCost(model);
      await trackUsage(user.id, 'fal.ai', model, 'run_model', cost);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              url,
              result,
              model,
              estimatedCostUsd: cost,
            }),
          },
        ],
      };
    },
  );

  return server;
}
