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
    succeed: vi.fn(),
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
  log: { error: vi.fn(), warn: vi.fn(), dim: vi.fn() },
  keyValue: vi.fn(),
}));

import { apiKeysCommand } from '../../commands/api-keys';
import { getAuth } from '../../lib/config';
import { log, keyValue } from '../../lib/output';
import ora from 'ora';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.mocked(getAuth).mockResolvedValue({ type: 'api_key', value: 'key' });
});

describe('api-keys create', () => {
  it('creates key and shows result', async () => {
    mockRequest.mockResolvedValue({
      api_key: { id: 'k1', name: 'CI key', prefix: 'anim_ci_' },
      key: 'anim_ci_abc123',
    });

    await apiKeysCommand.parseAsync(['create', '--name', 'CI key'], { from: 'user' });

    expect(mockRequest).toHaveBeenCalledWith('POST', '/api/v1/api-keys', {
      body: { name: 'CI key' },
    });
    expect(keyValue).toHaveBeenCalledWith(
      expect.objectContaining({
        Name: 'CI key',
        Key: 'anim_ci_abc123',
      }),
    );
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('Save this key'));
  });

  it('fails when not authenticated', async () => {
    vi.mocked(getAuth).mockResolvedValue(null);

    await apiKeysCommand.parseAsync(['create', '--name', 'test'], { from: 'user' });

    const spinner = vi.mocked(ora)();
    expect(spinner.fail).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('handles API error', async () => {
    mockRequest.mockRejectedValue(new Error('Forbidden'));

    await apiKeysCommand.parseAsync(['create', '--name', 'test'], { from: 'user' });

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Forbidden'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

describe('api-keys list', () => {
  it('shows API keys', async () => {
    mockRequest.mockResolvedValue({
      api_keys: [
        {
          id: 'k1',
          name: 'CI',
          prefix: 'anim_ci_',
          created_at: 1704067200000,
          last_used_at: 1706745600000,
        },
      ],
    });

    await apiKeysCommand.parseAsync(['list'], { from: 'user' });

    expect(keyValue).toHaveBeenCalledWith(
      expect.objectContaining({
        Name: 'CI',
        Prefix: 'anim_ci_',
      }),
    );
  });

  it('shows empty message when no keys', async () => {
    mockRequest.mockResolvedValue({ api_keys: [] });

    await apiKeysCommand.parseAsync(['list'], { from: 'user' });

    expect(log.dim).toHaveBeenCalledWith(expect.stringContaining('No API keys'));
    expect(keyValue).not.toHaveBeenCalled();
  });

  it('shows "never" for unused keys', async () => {
    mockRequest.mockResolvedValue({
      api_keys: [
        { id: 'k1', name: 'New', prefix: 'anim_', created_at: 1704067200000 },
      ],
    });

    await apiKeysCommand.parseAsync(['list'], { from: 'user' });

    expect(keyValue).toHaveBeenCalledWith(
      expect.objectContaining({ 'Last used': 'never' }),
    );
  });
});

describe('api-keys revoke', () => {
  it('revokes the key', async () => {
    mockRequest.mockResolvedValue(undefined);

    await apiKeysCommand.parseAsync(['revoke', 'key-123'], { from: 'user' });

    expect(mockRequest).toHaveBeenCalledWith('DELETE', '/api/v1/api-keys/key-123');
    const spinner = vi.mocked(ora)();
    expect(spinner.succeed).toHaveBeenCalledWith('API key revoked');
  });

  it('handles revoke error', async () => {
    mockRequest.mockRejectedValue(new Error('Not found'));

    await apiKeysCommand.parseAsync(['revoke', 'bad-id'], { from: 'user' });

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Not found'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
