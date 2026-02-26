import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBalance, getApiKeys, createCheckout, ApiError } from '@/lib/api';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('API client', () => {
  describe('getBalance', () => {
    it('returns balance on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ balance: 5.0 }),
      });

      const result = await getBalance('test-token');
      expect(result.balance).toBe(5.0);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/usage/balance'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('throws ApiError on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      await expect(getBalance('bad-token')).rejects.toThrow(ApiError);
    });
  });

  describe('getApiKeys', () => {
    it('returns keys array on success', async () => {
      const mockKeys = {
        keys: [
          { id: '1', prefix: 'abc123', name: 'test', last_used_at: null, created_at: '2026-01-01' },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockKeys),
      });

      const result = await getApiKeys('test-token');
      expect(result.keys).toHaveLength(1);
      expect(result.keys[0].prefix).toBe('abc123');
    });
  });

  describe('createCheckout', () => {
    it('sends amount in request body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ url: 'https://checkout.stripe.com/test' }),
      });

      const result = await createCheckout('test-token', 25);
      expect(result.url).toContain('stripe.com');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/billing/checkout'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ amount: 25 }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('includes status code in ApiError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Rate limited'),
      });

      try {
        await getBalance('test-token');
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).status).toBe(429);
      }
    });

    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getBalance('test-token')).rejects.toThrow('Network error');
    });
  });
});
