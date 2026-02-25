import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequest, MockHttpClient } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  const MockHttpClient = vi.fn(function () {
    return { request: mockRequest };
  });
  return { mockRequest, MockHttpClient };
});

vi.mock('../../lib/http', () => ({
  HttpClient: MockHttpClient,
}));

vi.mock('../../lib/output', () => ({
  log: { error: vi.fn(), dim: vi.fn() },
  table: vi.fn(),
}));

import { usageCommand } from '../../commands/usage';
import { log, table } from '../../lib/output';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('usage summary', () => {
  it('shows balance and usage table', async () => {
    mockRequest
      .mockResolvedValueOnce({ creditBalanceUsd: 12.5 })
      .mockResolvedValueOnce({
        usage: [{ date: '2025-01-15', totalCostUsd: 0.05, count: 3 }],
        totalCostUsd: 0.05,
      });

    await usageCommand.parseAsync([], { from: 'user' });

    expect(mockRequest).toHaveBeenCalledWith('GET', '/api/v1/usage/balance');
    expect(mockRequest).toHaveBeenCalledWith('GET', '/api/v1/usage?days=7');
    expect(table).toHaveBeenCalledWith(
      ['Date', 'Cost', 'Requests'],
      expect.any(Array),
    );
  });

  it('shows low balance warning', async () => {
    mockRequest
      .mockResolvedValueOnce({ creditBalanceUsd: 0.5 })
      .mockResolvedValueOnce({ usage: [], totalCostUsd: 0 });

    await usageCommand.parseAsync([], { from: 'user' });

    // Check that console.log was called with low balance warning
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Low balance'),
    );
  });

  it('shows empty usage message', async () => {
    mockRequest
      .mockResolvedValueOnce({ creditBalanceUsd: 10 })
      .mockResolvedValueOnce({ usage: [], totalCostUsd: 0 });

    await usageCommand.parseAsync([], { from: 'user' });

    expect(log.dim).toHaveBeenCalledWith(expect.stringContaining('No usage'));
    expect(table).not.toHaveBeenCalled();
  });

  it('handles API error', async () => {
    mockRequest.mockRejectedValue(new Error('Auth failed'));

    await usageCommand.parseAsync([], { from: 'user' });

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Auth failed'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

describe('usage history', () => {
  it('shows detailed records', async () => {
    mockRequest
      .mockResolvedValueOnce({ creditBalanceUsd: 5 })
      .mockResolvedValueOnce({
        records: [
          {
            id: 'r1',
            provider: 'fal.ai',
            model: 'fal-ai/flux/schnell',
            operation: 'generateImage',
            estimatedCostUsd: 0.005,
            createdAt: '2025-01-15T00:00:00Z',
          },
        ],
        total: 1,
      });

    await usageCommand.parseAsync(['history'], { from: 'user' });

    expect(mockRequest).toHaveBeenCalledWith(
      'GET',
      '/api/v1/usage/records?limit=20&days=30',
    );
    expect(table).toHaveBeenCalledWith(
      ['Date', 'Provider', 'Model', 'Operation', 'Cost'],
      expect.any(Array),
    );
  });

  it('passes custom limit and days', async () => {
    mockRequest
      .mockResolvedValueOnce({ creditBalanceUsd: 5 })
      .mockResolvedValueOnce({ records: [], total: 0 });

    await usageCommand.parseAsync(['history', '-l', '10', '-d', '7'], { from: 'user' });

    expect(mockRequest).toHaveBeenCalledWith(
      'GET',
      '/api/v1/usage/records?limit=10&days=7',
    );
  });

  it('shows truncation message when more records exist', async () => {
    mockRequest
      .mockResolvedValueOnce({ creditBalanceUsd: 5 })
      .mockResolvedValueOnce({
        records: [
          {
            id: 'r1',
            provider: 'fal.ai',
            model: 'fal-ai/flux/schnell',
            operation: 'gen',
            estimatedCostUsd: 0.01,
            createdAt: '2025-01-15T00:00:00Z',
          },
        ],
        total: 50,
      });

    await usageCommand.parseAsync(['history'], { from: 'user' });

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('1 of 50'),
    );
  });

  it('strips fal-ai/ prefix from model names', async () => {
    mockRequest
      .mockResolvedValueOnce({ creditBalanceUsd: 5 })
      .mockResolvedValueOnce({
        records: [
          {
            id: 'r1',
            provider: 'fal.ai',
            model: 'fal-ai/flux/schnell',
            operation: 'gen',
            estimatedCostUsd: 0.01,
            createdAt: '2025-01-15T00:00:00Z',
          },
        ],
        total: 1,
      });

    await usageCommand.parseAsync(['history'], { from: 'user' });

    expect(table).toHaveBeenCalledWith(
      expect.any(Array),
      expect.arrayContaining([
        expect.arrayContaining(['flux/schnell']),
      ]),
    );
  });
});
