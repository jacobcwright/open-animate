import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequest, MockHttpClient } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  const MockHttpClient = vi.fn(function () {
    return { request: mockRequest };
  });
  return { mockRequest, MockHttpClient };
});

vi.mock('node:http', () => ({
  createServer: vi.fn(),
}));

vi.mock('ora', () => {
  const spinner: Record<string, unknown> = {
    start: vi.fn(() => spinner),
    stop: vi.fn(),
    fail: vi.fn(),
    succeed: vi.fn(),
    text: '',
  };
  return { default: vi.fn(() => spinner) };
});

vi.mock('open', () => ({ default: vi.fn(() => Promise.resolve()) }));

vi.mock('../../lib/http', () => ({
  HttpClient: MockHttpClient,
}));

vi.mock('../../lib/output', () => ({
  log: { error: vi.fn(), warn: vi.fn(), dim: vi.fn(), success: vi.fn() },
  table: vi.fn(),
}));

import { createServer } from 'node:http';
import { billingCommand } from '../../commands/billing';
import { log, table } from '../../lib/output';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('billing summary', () => {
  it('shows balance and payment history', async () => {
    mockRequest
      .mockResolvedValueOnce({ creditBalanceUsd: 25.0 })
      .mockResolvedValueOnce({
        payments: [
          {
            id: 'p1',
            amountUsd: 10,
            creditsUsd: 10,
            status: 'completed',
            createdAt: '2025-01-15T00:00:00Z',
            completedAt: '2025-01-15T00:01:00Z',
          },
        ],
        totalPurchasedUsd: 10,
      });

    await billingCommand.parseAsync([], { from: 'user' });

    expect(mockRequest).toHaveBeenCalledWith('GET', '/api/v1/usage/balance');
    expect(mockRequest).toHaveBeenCalledWith('GET', '/api/v1/billing/history?limit=5');
    expect(table).toHaveBeenCalledWith(
      ['Date', 'Amount', 'Credits', 'Status'],
      expect.any(Array),
    );
  });

  it('shows empty history message', async () => {
    mockRequest
      .mockResolvedValueOnce({ creditBalanceUsd: 0 })
      .mockResolvedValueOnce({ payments: [], totalPurchasedUsd: 0 });

    await billingCommand.parseAsync([], { from: 'user' });

    expect(log.dim).toHaveBeenCalledWith(expect.stringContaining('No purchases'));
  });

  it('handles API error', async () => {
    mockRequest.mockRejectedValue(new Error('Server error'));

    await billingCommand.parseAsync([], { from: 'user' });

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Server error'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

describe('billing buy', () => {
  it('shows help when no amount specified', async () => {
    await billingCommand.parseAsync(['buy'], { from: 'user' });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Purchase credits'));
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('rejects amount below minimum', async () => {
    await billingCommand.parseAsync(['buy', '--amount', '2'], { from: 'user' });

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Minimum'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('rejects non-numeric amount', async () => {
    await billingCommand.parseAsync(['buy', '--amount', 'abc'], { from: 'user' });

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Minimum'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('completes successful payment flow', async () => {
    // Setup createServer mock for findAvailablePort + waitForCallback
    let callCount = 0;
    vi.mocked(createServer).mockImplementation(((handler?: Function) => {
      callCount++;
      return {
        listen: vi.fn((...args: unknown[]) => {
          const cb = args.find((a) => typeof a === 'function') as Function | undefined;
          if (cb) cb();
          if (handler && callCount === 2) {
            process.nextTick(() => {
              handler(
                { url: '/callback?status=success' },
                { writeHead: vi.fn(), end: vi.fn() },
              );
            });
          }
        }),
        address: vi.fn(() => ({ port: 54321 })),
        close: vi.fn((cb?: Function) => {
          if (cb) cb();
        }),
        on: vi.fn(),
      };
    }) as unknown as typeof createServer);

    mockRequest
      .mockResolvedValueOnce({
        checkoutUrl: 'https://checkout.stripe.com/session',
        sessionId: 'cs_test_123',
      })
      .mockResolvedValueOnce({ creditBalanceUsd: 35.0 });

    await billingCommand.parseAsync(['buy', '--amount', '25'], { from: 'user' });

    expect(mockRequest).toHaveBeenCalledWith('POST', '/api/v1/billing/checkout', {
      body: { amount: 25, port: 54321 },
    });
    expect(log.success).toHaveBeenCalledWith(expect.stringContaining('$35.00'));
  });

  it('handles cancelled payment', async () => {
    let callCount = 0;
    vi.mocked(createServer).mockImplementation(((handler?: Function) => {
      callCount++;
      return {
        listen: vi.fn((...args: unknown[]) => {
          const cb = args.find((a) => typeof a === 'function') as Function | undefined;
          if (cb) cb();
          if (handler && callCount === 2) {
            process.nextTick(() => {
              handler(
                { url: '/callback?status=cancelled' },
                { writeHead: vi.fn(), end: vi.fn() },
              );
            });
          }
        }),
        address: vi.fn(() => ({ port: 54321 })),
        close: vi.fn((cb?: Function) => {
          if (cb) cb();
        }),
        on: vi.fn(),
      };
    }) as unknown as typeof createServer);

    mockRequest.mockResolvedValueOnce({
      checkoutUrl: 'https://checkout.stripe.com/session',
      sessionId: 'cs_test_456',
    });

    await billingCommand.parseAsync(['buy', '--amount', '10'], { from: 'user' });

    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('cancelled'));
  });
});
