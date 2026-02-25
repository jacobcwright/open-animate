import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlatformProvider } from '../../../lib/providers/platform';

vi.mock('../../../lib/config', () => ({
  getApiUrl: vi.fn(() => 'https://api.test.dev'),
  getAuth: vi.fn(() => ({ type: 'api_key', value: 'test_key' })),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Map(),
  };
}

/** Helper to run a promise that uses submitAndPoll (which sleeps) concurrently with timer advancement */
async function withTimerAdvance<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  const result = vi.advanceTimersByTimeAsync(ms).then(() => promise);
  return result;
}

describe('PlatformProvider', () => {
  it('has name oanim', () => {
    const provider = new PlatformProvider();
    expect(provider.name).toBe('oanim');
  });

  describe('generateImage', () => {
    it('calls /api/v1/media/generate without custom model', async () => {
      const data = {
        url: 'https://cdn/img.png',
        provider: 'fal.ai',
        model: 'fal-ai/flux/schnell',
        estimatedCostUsd: 0.005,
      };
      mockFetch.mockResolvedValue(jsonResponse(data));
      const provider = new PlatformProvider();
      const result = await provider.generateImage('a cat');
      expect(result.url).toBe('https://cdn/img.png');
      expect(result.provider).toBe('fal.ai');
    });

    it('uses submitAndPoll with custom model', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          requestId: 'req-1',
          model: 'fal-ai/flux/dev',
          provider: 'fal.ai',
          estimatedCostUsd: 0.035,
        }),
      );
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          status: 'COMPLETED',
          url: 'https://cdn/custom.png',
          provider: 'fal.ai',
          model: 'fal-ai/flux/dev',
          estimatedCostUsd: 0.035,
        }),
      );

      const provider = new PlatformProvider();
      const result = await withTimerAdvance(
        provider.generateImage('a cat', { model: 'fal-ai/flux/dev' }),
      );
      expect(result.url).toBe('https://cdn/custom.png');
    });
  });

  describe('editImage', () => {
    it('calls /api/v1/media/edit without custom model', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          url: 'https://cdn/edited.png',
          provider: 'fal.ai',
          model: 'flux-edit',
          estimatedCostUsd: 0.03,
        }),
      );
      const provider = new PlatformProvider();
      const result = await provider.editImage('https://src.png', 'make blue');
      expect(result.url).toBe('https://cdn/edited.png');
    });

    it('uses submitAndPoll with custom model', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          requestId: 'req-2',
          model: 'custom-edit',
          provider: 'fal.ai',
          estimatedCostUsd: 0.05,
        }),
      );
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          status: 'COMPLETED',
          url: 'https://cdn/custom-edit.png',
          provider: 'fal.ai',
          model: 'custom-edit',
        }),
      );
      const provider = new PlatformProvider();
      const result = await withTimerAdvance(
        provider.editImage('https://src.png', 'edit', 'custom-edit'),
      );
      expect(result.url).toBe('https://cdn/custom-edit.png');
    });
  });

  describe('removeBackground', () => {
    it('calls /api/v1/media/remove-background without custom model', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          url: 'https://cdn/nobg.png',
          provider: 'fal.ai',
          model: 'birefnet',
          estimatedCostUsd: 0.007,
        }),
      );
      const provider = new PlatformProvider();
      const result = await provider.removeBackground('https://photo.png');
      expect(result.url).toBe('https://cdn/nobg.png');
    });

    it('uses submitAndPoll with custom model', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          requestId: 'req-3',
          model: 'custom-bg',
          provider: 'fal.ai',
          estimatedCostUsd: 0.01,
        }),
      );
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          status: 'COMPLETED',
          url: 'https://cdn/custom-bg.png',
          provider: 'fal.ai',
          model: 'custom-bg',
        }),
      );
      const provider = new PlatformProvider();
      const result = await withTimerAdvance(
        provider.removeBackground('https://photo.png', 'custom-bg'),
      );
      expect(result.url).toBe('https://cdn/custom-bg.png');
    });
  });

  describe('upscale', () => {
    it('calls /api/v1/media/upscale without custom model', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          url: 'https://cdn/big.png',
          provider: 'fal.ai',
          model: 'upscaler',
          estimatedCostUsd: 0.03,
        }),
      );
      const provider = new PlatformProvider();
      const result = await provider.upscale('https://small.png', 4);
      expect(result.url).toBe('https://cdn/big.png');
    });

    it('uses submitAndPoll with custom model', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          requestId: 'req-4',
          model: 'custom-upscaler',
          provider: 'fal.ai',
          estimatedCostUsd: 0.05,
        }),
      );
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          status: 'COMPLETED',
          url: 'https://cdn/custom-up.png',
          provider: 'fal.ai',
          model: 'custom-upscaler',
        }),
      );
      const provider = new PlatformProvider();
      const result = await withTimerAdvance(
        provider.upscale('https://small.png', 2, 'custom-upscaler'),
      );
      expect(result.url).toBe('https://cdn/custom-up.png');
    });
  });

  describe('run', () => {
    it('uses submitAndPoll and returns RunResult', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          requestId: 'req-5',
          model: 'video-model',
          provider: 'fal.ai',
          estimatedCostUsd: 0.5,
        }),
      );
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          status: 'COMPLETED',
          url: 'https://cdn/video.mp4',
          result: { duration: 5 },
          provider: 'fal.ai',
          model: 'video-model',
          estimatedCostUsd: 0.5,
        }),
      );
      const provider = new PlatformProvider();
      const result = await withTimerAdvance(
        provider.run('video-model', { prompt: 'test' }),
      );
      expect(result.url).toBe('https://cdn/video.mp4');
      expect(result.result).toEqual({ duration: 5 });
    });
  });

  describe('submitAndPoll fallback', () => {
    it('falls back to /run on 404', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse('not found', 404));
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          url: 'https://cdn/sync.png',
          result: {},
          provider: 'fal.ai',
          model: 'model',
          estimatedCostUsd: 0.01,
        }),
      );
      const provider = new PlatformProvider();
      const result = await provider.run('model', { input: 'x' });
      expect(result.url).toBe('https://cdn/sync.png');
    });

    it('propagates non-404 errors', async () => {
      mockFetch.mockResolvedValue(jsonResponse('server error', 500));
      const provider = new PlatformProvider();
      await expect(provider.run('model', {})).rejects.toThrow('API error (500)');
    });
  });

  describe('submitAndPoll polling', () => {
    it('polls until COMPLETED', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          requestId: 'req-poll',
          statusUrl: 'https://fal/status',
          responseUrl: 'https://fal/response',
          model: 'm',
          provider: 'fal.ai',
          estimatedCostUsd: 0.1,
        }),
      );
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          status: 'IN_QUEUE',
          queuePosition: 2,
          provider: 'fal.ai',
          model: 'm',
        }),
      );
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          status: 'IN_PROGRESS',
          provider: 'fal.ai',
          model: 'm',
        }),
      );
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          status: 'COMPLETED',
          url: 'https://cdn/done.png',
          provider: 'fal.ai',
          model: 'm',
        }),
      );

      const provider = new PlatformProvider();
      const result = await withTimerAdvance(provider.run('m', {}));
      expect(result.url).toBe('https://cdn/done.png');
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('runAsMediaResult error', () => {
    it('throws when completed without URL', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          requestId: 'req-no-url',
          model: 'm',
          provider: 'fal.ai',
          estimatedCostUsd: 0.01,
        }),
      );
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          status: 'COMPLETED',
          url: null,
          provider: 'fal.ai',
          model: 'm',
        }),
      );
      const provider = new PlatformProvider();
      const promise = provider.generateImage('test', { model: 'm' });
      // Attach rejection handler immediately to prevent unhandled rejection
      const caught = promise.catch((e: Error) => e);
      await vi.advanceTimersByTimeAsync(10000);
      const error = await caught;
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('did not return an image URL');
    });
  });
});
