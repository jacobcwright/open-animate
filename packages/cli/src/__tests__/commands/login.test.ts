import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequest, mockSetAuth, MockHttpClient } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  const mockSetAuth = vi.fn();
  const MockHttpClient = vi.fn(function () {
    return { request: mockRequest, setAuth: mockSetAuth };
  });
  return { mockRequest, mockSetAuth, MockHttpClient };
});

vi.mock('node:http', () => ({
  createServer: vi.fn(),
}));

vi.mock('ora', () => {
  const spinner: Record<string, unknown> = {
    start: vi.fn(() => spinner),
    stop: vi.fn(),
    fail: vi.fn(),
    text: '',
  };
  return { default: vi.fn(() => spinner) };
});

vi.mock('open', () => ({ default: vi.fn(() => Promise.resolve()) }));

vi.mock('../../lib/config', () => ({
  saveCredentials: vi.fn(() => Promise.resolve()),
  getApiUrl: vi.fn(() => Promise.resolve('https://api.test.dev')),
}));

vi.mock('../../lib/http', () => ({
  HttpClient: MockHttpClient,
}));

vi.mock('../../lib/output', () => ({
  log: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  splashBanner: vi.fn(),
}));

import { createServer } from 'node:http';
import { loginCommand } from '../../commands/login';
import { saveCredentials } from '../../lib/config';
import { log, splashBanner } from '../../lib/output';
import openFn from 'open';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('login --token', () => {
  it('verifies key and saves credentials', async () => {
    mockRequest.mockResolvedValue({ email: 'user@test.com' });

    await loginCommand.parseAsync(['--token', 'my-key'], { from: 'user' });

    expect(mockSetAuth).toHaveBeenCalledWith('my-key');
    expect(mockRequest).toHaveBeenCalledWith('GET', '/api/v1/auth/me');
    expect(saveCredentials).toHaveBeenCalledWith({ api_key: 'my-key' });
    expect(log.success).toHaveBeenCalledWith('Logged in as user@test.com');
    expect(splashBanner).toHaveBeenCalled();
  });

  it('handles verification failure', async () => {
    mockRequest.mockRejectedValue(new Error('Not authenticated'));

    await loginCommand.parseAsync(['--token', 'bad-key'], { from: 'user' });

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

describe('login browser flow', () => {
  function setupCreateServerMock(callbackKey: string | null) {
    let callCount = 0;
    vi.mocked(createServer).mockImplementation(((handler?: Function) => {
      callCount++;
      return {
        listen: vi.fn((...args: unknown[]) => {
          const cb = args.find((a) => typeof a === 'function') as Function | undefined;
          if (cb) cb();
          // For waitForCallback server (second call with handler), simulate callback
          if (handler && callCount === 2 && callbackKey) {
            process.nextTick(() => {
              handler(
                { url: `/callback?key=${callbackKey}` },
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
  }

  it('opens browser and saves credentials on callback', async () => {
    setupCreateServerMock('oauth-key');
    mockRequest.mockResolvedValue({ email: 'oauth@test.com' });

    await loginCommand.parseAsync([], { from: 'user' });

    expect(openFn).toHaveBeenCalledWith(
      'https://api.test.dev/api/v1/auth/cli/login?port=54321',
    );
    expect(saveCredentials).toHaveBeenCalledWith({ api_key: 'oauth-key' });
    expect(log.success).toHaveBeenCalledWith('Logged in as oauth@test.com');
  });

  it('shows timeout hint on timeout', async () => {
    vi.useFakeTimers();

    setupCreateServerMock(null); // No callback → timeout

    const promise = loginCommand.parseAsync([], { from: 'user' });
    await vi.advanceTimersByTimeAsync(121_000);
    await promise;

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('timed out'));
    expect(log.info).toHaveBeenCalledWith(expect.stringContaining('try running'));
    expect(process.exit).toHaveBeenCalledWith(1);

    vi.useRealTimers();
  });
});
