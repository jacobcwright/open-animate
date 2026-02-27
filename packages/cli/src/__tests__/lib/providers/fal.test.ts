import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FalProvider } from '../../../lib/providers/fal';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ANIMATE_FAL_KEY = 'test-fal-key';
});

afterEach(() => {
  delete process.env.ANIMATE_FAL_KEY;
});

function falResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

describe('FalProvider', () => {
  const provider = new FalProvider();

  it('has name fal.ai', () => {
    expect(provider.name).toBe('fal.ai');
  });

  describe('generateImage', () => {
    it('calls fal.run with default model', async () => {
      mockFetch.mockResolvedValue(
        falResponse({ images: [{ url: 'https://fal.ai/img.png' }] }),
      );
      const result = await provider.generateImage('a cat');
      expect(result.url).toBe('https://fal.ai/img.png');
      expect(result.model).toBe('fal-ai/flux-2-flex');
      expect(result.provider).toBe('fal.ai');
      expect(result.estimatedCostUsd).toBeGreaterThan(0);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://fal.run/fal-ai/flux-2-flex',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Key test-fal-key',
          }),
        }),
      );
    });

    it('uses custom model', async () => {
      mockFetch.mockResolvedValue(
        falResponse({ images: [{ url: 'https://fal.ai/img.png' }] }),
      );
      await provider.generateImage('a cat', { model: 'fal-ai/nano-banana-2' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://fal.run/fal-ai/nano-banana-2',
        expect.any(Object),
      );
    });

    it('throws on no image URL', async () => {
      mockFetch.mockResolvedValue(falResponse({}));
      await expect(provider.generateImage('a cat')).rejects.toThrow(
        'no image URL found',
      );
    });
  });

  describe('editImage', () => {
    it('sends image URL and prompt', async () => {
      mockFetch.mockResolvedValue(
        falResponse({ image: { url: 'https://fal.ai/edited.png' } }),
      );
      const result = await provider.editImage('https://source.png', 'make blue');
      expect(result.url).toBe('https://fal.ai/edited.png');
    });

    it('uses custom model', async () => {
      mockFetch.mockResolvedValue(
        falResponse({ images: [{ url: 'https://fal.ai/x.png' }] }),
      );
      await provider.editImage('https://img.png', 'edit', 'fal-ai/reve/edit');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://fal.run/fal-ai/reve/edit',
        expect.any(Object),
      );
    });
  });

  describe('removeBackground', () => {
    it('uses birefnet by default', async () => {
      mockFetch.mockResolvedValue(
        falResponse({ image: { url: 'https://fal.ai/nobg.png' } }),
      );
      const result = await provider.removeBackground('https://photo.png');
      expect(result.url).toBe('https://fal.ai/nobg.png');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://fal.run/fal-ai/birefnet',
        expect.any(Object),
      );
    });
  });

  describe('upscale', () => {
    it('sends scale parameter', async () => {
      mockFetch.mockResolvedValue(
        falResponse({ image: { url: 'https://fal.ai/upscaled.png' } }),
      );
      const result = await provider.upscale('https://small.png', 4);
      expect(result.url).toBe('https://fal.ai/upscaled.png');
    });
  });

  describe('run', () => {
    it('returns raw result with URL extraction', async () => {
      mockFetch.mockResolvedValue(
        falResponse({ video: { url: 'https://fal.ai/video.mp4' }, seed: 42 }),
      );
      const result = await provider.run('fal-ai/kling-video/v2.5-turbo/pro/text-to-video', {
        prompt: 'a wave',
      });
      expect(result.url).toBe('https://fal.ai/video.mp4');
      expect(result.result).toEqual(
        expect.objectContaining({ seed: 42 }),
      );
    });

    it('returns null URL when no media found', async () => {
      mockFetch.mockResolvedValue(falResponse({ text: 'output' }));
      const result = await provider.run('some/model', { input: 'test' });
      expect(result.url).toBeNull();
    });

    it('extracts audio_file URL', async () => {
      mockFetch.mockResolvedValue(
        falResponse({ audio_file: { url: 'https://fal.ai/audio.mp3' } }),
      );
      const result = await provider.run('beatoven/music-generation', {
        prompt: 'music',
      });
      expect(result.url).toBe('https://fal.ai/audio.mp3');
    });
  });

  describe('missing API key', () => {
    it('throws when ANIMATE_FAL_KEY is not set', async () => {
      delete process.env.ANIMATE_FAL_KEY;
      const p = new FalProvider();
      await expect(p.generateImage('test')).rejects.toThrow(
        'ANIMATE_FAL_KEY',
      );
    });
  });

  describe('API errors', () => {
    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });
      await expect(provider.generateImage('test')).rejects.toThrow(
        'fal.ai API error (500)',
      );
    });
  });
});
