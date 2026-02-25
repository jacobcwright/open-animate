import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MediaGateway } from '../../lib/gateway';
import type { MediaProvider, MediaResult, RunResult } from '../../lib/providers/types';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(() => Promise.resolve(Buffer.from('image-data'))),
  writeFile: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../lib/config', () => ({
  getAuth: vi.fn(() => Promise.resolve(null)),
  getApiUrl: vi.fn(() => 'https://api.test.dev'),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeMockProvider(): MediaProvider {
  const result: MediaResult = {
    url: 'https://cdn/output.png',
    provider: 'test',
    model: 'test-model',
    estimatedCostUsd: 0.01,
  };
  return {
    name: 'test',
    generateImage: vi.fn(() => Promise.resolve(result)),
    editImage: vi.fn(() => Promise.resolve(result)),
    removeBackground: vi.fn(() => Promise.resolve(result)),
    upscale: vi.fn(() => Promise.resolve(result)),
    run: vi.fn(() =>
      Promise.resolve({ ...result, url: null, result: { data: true } } as RunResult),
    ),
  };
}

beforeEach(async () => {
  vi.clearAllMocks();
  delete process.env.ANIMATE_MAX_USD_PER_RUN;
  delete process.env.ANIMATE_FAL_KEY;
  // Re-stub fetch in case a test replaced it (e.g. insufficient credits test)
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockResolvedValue({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  });
  // Reset getAuth to avoid pollution from tests that override it
  const { getAuth } = await import('../../lib/config');
  vi.mocked(getAuth).mockResolvedValue(null);
});

afterEach(() => {
  delete process.env.ANIMATE_MAX_USD_PER_RUN;
  delete process.env.ANIMATE_FAL_KEY;
});

describe('MediaGateway', () => {
  describe('generateImage', () => {
    it('delegates to provider and downloads result', async () => {
      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      await gw.generateImage('a cat', '/tmp/out.png');
      expect(provider.generateImage).toHaveBeenCalledWith('a cat', undefined);
      expect(gw.totalCostUsd).toBeCloseTo(0.01);
      expect(gw.usageRecords).toHaveLength(1);
      expect(gw.usageRecords[0].operation).toBe('generateImage');
    });
  });

  describe('editImage', () => {
    it('reads input file as data URL', async () => {
      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      await gw.editImage('/tmp/in.png', 'make blue', '/tmp/out.png');
      expect(provider.editImage).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64,'),
        'make blue',
        undefined,
      );
    });
  });

  describe('removeBackground', () => {
    it('calls provider with data URL', async () => {
      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      await gw.removeBackground('/tmp/in.jpg', '/tmp/out.png');
      expect(provider.removeBackground).toHaveBeenCalledWith(
        expect.stringContaining('data:image/jpg;base64,'),
        undefined,
      );
    });
  });

  describe('upscaleImage', () => {
    it('calls provider upscale', async () => {
      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      await gw.upscaleImage('/tmp/in.png', '/tmp/out.png');
      expect(provider.upscale).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64,'),
        2,
        undefined,
      );
    });
  });

  describe('run', () => {
    it('calls provider run and returns result', async () => {
      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      const result = await gw.run('my-model', { input: 'test' });
      expect(provider.run).toHaveBeenCalledWith('my-model', { input: 'test' });
      expect(result.result).toEqual({ data: true });
    });
  });

  describe('cost limit', () => {
    it('throws when projected cost exceeds limit', async () => {
      process.env.ANIMATE_MAX_USD_PER_RUN = '0.005';
      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      // Default cost for unknown model is 0.05 * 1.4 = 0.07 > 0.005
      await expect(gw.run('expensive-model', {})).rejects.toThrow(
        'Cost limit exceeded',
      );
    });

    it('allows operations within limit', async () => {
      process.env.ANIMATE_MAX_USD_PER_RUN = '1.00';
      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      await gw.run('test-model', {});
      expect(gw.totalCostUsd).toBeGreaterThan(0);
    });

    it('does not enforce when limit not set', async () => {
      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      await gw.run('any-model', {});
      expect(gw.totalCostUsd).toBeGreaterThan(0);
    });
  });

  describe('credit balance', () => {
    it('skips check when not authenticated', async () => {
      const { getAuth } = await import('../../lib/config');
      vi.mocked(getAuth).mockResolvedValue(null);
      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      await gw.generateImage('test', '/tmp/out.png');
      // Should succeed without credit check
      expect(gw.usageRecords).toHaveLength(1);
    });

    it('throws on insufficient credits', async () => {
      const { getAuth, getApiUrl } = await import('../../lib/config');
      vi.mocked(getAuth).mockResolvedValue({ type: 'api_key', value: 'key' });
      vi.mocked(getApiUrl).mockResolvedValue('https://api.test.dev');

      // Balance check returns low balance
      const balanceFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ creditBalanceUsd: 0.001 }),
        text: () => Promise.resolve(''),
        headers: new Map(),
      });
      vi.stubGlobal('fetch', balanceFetch);

      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      await expect(gw.run('expensive', {})).rejects.toThrow(
        'Insufficient credits',
      );
    });
  });

  describe('usage tracking', () => {
    it('accumulates usage across operations', async () => {
      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      await gw.generateImage('a', '/tmp/1.png');
      await gw.generateImage('b', '/tmp/2.png');
      expect(gw.usageRecords).toHaveLength(2);
      expect(gw.totalCostUsd).toBeCloseTo(0.02);
    });
  });

  describe('download error', () => {
    it('throws on failed download', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      const provider = makeMockProvider();
      const gw = new MediaGateway(provider);
      await expect(gw.generateImage('test', '/tmp/out.png')).rejects.toThrow(
        'Failed to download',
      );
    });
  });
});
