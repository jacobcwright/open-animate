import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequest, MockHttpClient } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  const MockHttpClient = vi.fn(function () {
    return { request: mockRequest };
  });
  return { mockRequest, MockHttpClient };
});

vi.mock('ora', () => {
  const spinner: Record<string, unknown> = {
    start: vi.fn(() => spinner),
    stop: vi.fn(),
    fail: vi.fn(),
    text: '',
  };
  return { default: vi.fn(() => spinner) };
});

vi.mock('../../lib/config', () => ({
  getAuth: vi.fn(() => Promise.resolve({ type: 'api_key', value: 'key' })),
}));

vi.mock('../../lib/http', () => ({
  HttpClient: MockHttpClient,
}));

vi.mock('../../lib/output', () => ({
  log: { error: vi.fn() },
  keyValue: vi.fn(),
}));

import { whoamiCommand } from '../../commands/whoami';
import { getAuth } from '../../lib/config';
import { log, keyValue } from '../../lib/output';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  // Reset getAuth to default (authenticated)
  vi.mocked(getAuth).mockResolvedValue({ type: 'api_key', value: 'key' });
});

describe('whoami command', () => {
  it('shows user info when authenticated', async () => {
    mockRequest.mockResolvedValue({
      id: 'user-1',
      email: 'dev@test.com',
      credit_balance_usd: 5.5,
      created_at: '2025-01-15T00:00:00Z',
    });

    await whoamiCommand.parseAsync([], { from: 'user' });

    expect(mockRequest).toHaveBeenCalledWith('GET', '/api/v1/auth/me');
    expect(keyValue).toHaveBeenCalledWith({
      Email: 'dev@test.com',
      Credits: '$5.50',
      ID: 'user-1',
      'Member since': expect.any(String),
    });
  });

  it('exits when not logged in', async () => {
    vi.mocked(getAuth).mockResolvedValue(null);
    // Override to throw so execution stops (matching real process.exit behavior)
    vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);

    await expect(
      whoamiCommand.parseAsync([], { from: 'user' }),
    ).rejects.toThrow('process.exit(1)');

    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining('Not logged in'),
    );
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('handles API error', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'));

    await whoamiCommand.parseAsync([], { from: 'user' });

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Network error'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('formats credit balance with two decimal places', async () => {
    mockRequest.mockResolvedValue({
      id: 'u',
      email: 'a@b.com',
      credit_balance_usd: 0.1,
      created_at: '2025-06-01T00:00:00Z',
    });

    await whoamiCommand.parseAsync([], { from: 'user' });

    expect(keyValue).toHaveBeenCalledWith(
      expect.objectContaining({ Credits: '$0.10' }),
    );
  });
});
