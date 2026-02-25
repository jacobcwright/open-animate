import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient } from '../../lib/http';

vi.mock('../../lib/config', () => ({
  getApiUrl: vi.fn(() => 'https://api.test.dev'),
  getAuth: vi.fn(() => ({ type: 'api_key', value: 'test_key' })),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Map([['Retry-After', '30']]),
  };
}

describe('HttpClient', () => {
  describe('request', () => {
    it('makes GET request with auth header', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ data: true }));
      const client = new HttpClient();
      const result = await client.request<{ data: boolean }>('GET', '/test');
      expect(result).toEqual({ data: true });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.dev/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_key',
          }),
        }),
      );
    });

    it('sends JSON body for POST', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ id: 1 }));
      const client = new HttpClient();
      await client.request('POST', '/items', { body: { name: 'test' } });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.dev/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        }),
      );
    });

    it('handles 204 No Content', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Map(),
      });
      const client = new HttpClient();
      const result = await client.request('DELETE', '/item/1');
      expect(result).toBeUndefined();
    });

    it('throws on 401', async () => {
      mockFetch.mockResolvedValue(jsonResponse('unauthorized', 401));
      const client = new HttpClient();
      await expect(client.request('GET', '/test')).rejects.toThrow(
        'Not authenticated',
      );
    });

    it('throws on 429 with retry info', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        headers: { get: (key: string) => key === 'Retry-After' ? '30' : null },
        text: () => Promise.resolve('too many requests'),
      });
      const client = new HttpClient();
      await expect(client.request('GET', '/test')).rejects.toThrow(
        'Rate limited',
      );
    });

    it('throws on other errors', async () => {
      mockFetch.mockResolvedValue(jsonResponse('not found', 404));
      const client = new HttpClient();
      await expect(client.request('GET', '/test')).rejects.toThrow(
        'API error (404)',
      );
    });

    it('lazy-initializes on first request', async () => {
      const { getApiUrl } = await import('../../lib/config');
      mockFetch.mockResolvedValue(jsonResponse({}));
      const client = new HttpClient();
      await client.request('GET', '/a');
      await client.request('GET', '/b');
      // init should only be called once
      expect(getApiUrl).toHaveBeenCalledTimes(1);
    });
  });

  describe('setAuth', () => {
    it('overrides auth header after init', async () => {
      mockFetch.mockResolvedValue(jsonResponse({}));
      const client = new HttpClient();
      // First request triggers init with default auth
      await client.request('GET', '/first');
      vi.clearAllMocks();
      mockFetch.mockResolvedValue(jsonResponse({}));
      // setAuth overrides for subsequent requests
      client.setAuth('custom_token');
      await client.request('GET', '/test');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer custom_token',
          }),
        }),
      );
    });
  });

  describe('uploadBlob', () => {
    it('uploads blob without Content-Type header', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ key: 'abc' }));
      const client = new HttpClient();
      const blob = new Blob(['data'], { type: 'application/octet-stream' });
      const result = await client.uploadBlob<{ key: string }>('/upload', blob);
      expect(result).toEqual({ key: 'abc' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.dev/upload',
        expect.objectContaining({
          method: 'POST',
          body: blob,
        }),
      );
    });

    it('throws on 401', async () => {
      mockFetch.mockResolvedValue(jsonResponse('unauthorized', 401));
      const client = new HttpClient();
      const blob = new Blob(['data']);
      await expect(client.uploadBlob('/upload', blob)).rejects.toThrow(
        'Not authenticated',
      );
    });

    it('throws on 429', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        headers: { get: () => '60' },
        text: () => Promise.resolve('rate limit'),
      });
      const client = new HttpClient();
      const blob = new Blob(['data']);
      await expect(client.uploadBlob('/upload', blob)).rejects.toThrow(
        'Rate limited',
      );
    });

    it('throws generic error for other status codes', async () => {
      mockFetch.mockResolvedValue(jsonResponse('server error', 500));
      const client = new HttpClient();
      const blob = new Blob(['data']);
      await expect(client.uploadBlob('/upload', blob)).rejects.toThrow(
        'API error (500)',
      );
    });
  });
});
