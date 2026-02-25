import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('open', () => ({ default: vi.fn(() => Promise.resolve()) }));

vi.mock('../../lib/config', () => ({
  clearCredentials: vi.fn(() => Promise.resolve()),
  getApiUrl: vi.fn(() => Promise.resolve('https://api.test.dev')),
}));

vi.mock('../../lib/output', () => ({
  log: { success: vi.fn(), error: vi.fn() },
}));

import { logoutCommand } from '../../commands/logout';
import { clearCredentials } from '../../lib/config';
import { log } from '../../lib/output';
import openFn from 'open';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('logout command', () => {
  it('clears credentials and opens browser logout', async () => {
    await logoutCommand.parseAsync([], { from: 'user' });

    expect(clearCredentials).toHaveBeenCalled();
    expect(openFn).toHaveBeenCalledWith(
      'https://api.test.dev/api/v1/auth/cli/logout',
    );
    expect(log.success).toHaveBeenCalledWith('Logged out. Credentials cleared.');
  });

  it('succeeds even when browser open fails', async () => {
    vi.mocked(openFn).mockRejectedValue(new Error('no browser'));

    await logoutCommand.parseAsync([], { from: 'user' });

    expect(clearCredentials).toHaveBeenCalled();
    expect(log.success).toHaveBeenCalledWith('Logged out. Credentials cleared.');
  });

  it('succeeds even when getApiUrl fails', async () => {
    const { getApiUrl } = await import('../../lib/config');
    vi.mocked(getApiUrl).mockRejectedValue(new Error('no config'));

    await logoutCommand.parseAsync([], { from: 'user' });

    expect(clearCredentials).toHaveBeenCalled();
    expect(log.success).toHaveBeenCalledWith('Logged out. Credentials cleared.');
  });
});
