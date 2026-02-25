import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadCredentials,
  saveCredentials,
  clearCredentials,
  loadConfig,
  saveConfig,
  getApiUrl,
  getAuth,
} from '../../lib/config';

// Mock fs and os
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  chmod: vi.fn(),
}));

vi.mock('node:os', () => ({
  homedir: vi.fn(() => '/mock/home'),
}));

import { readFile, writeFile, mkdir, chmod } from 'node:fs/promises';

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);
const mockMkdir = vi.mocked(mkdir);
const mockChmod = vi.mocked(chmod);

beforeEach(() => {
  vi.clearAllMocks();
  mockMkdir.mockResolvedValue(undefined);
  mockWriteFile.mockResolvedValue(undefined);
  mockChmod.mockResolvedValue(undefined);
});

afterEach(() => {
  delete process.env.ANIMATE_API_URL;
  delete process.env.ANIMATE_API_KEY;
});

describe('loadCredentials', () => {
  it('returns credentials from yaml file', async () => {
    mockReadFile.mockResolvedValue('token: abc123\napi_key: key456\n');
    const creds = await loadCredentials();
    expect(creds).toEqual({ token: 'abc123', api_key: 'key456' });
    expect(mockReadFile).toHaveBeenCalledWith(
      '/mock/home/.oanim/credentials.yaml',
      'utf-8',
    );
  });

  it('returns empty object when file not found', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const creds = await loadCredentials();
    expect(creds).toEqual({});
  });

  it('returns empty object when file is empty', async () => {
    mockReadFile.mockResolvedValue('');
    const creds = await loadCredentials();
    expect(creds).toEqual({});
  });
});

describe('saveCredentials', () => {
  it('merges new credentials with existing', async () => {
    mockReadFile.mockResolvedValue('token: old_token\n');
    await saveCredentials({ api_key: 'new_key' });

    expect(mockMkdir).toHaveBeenCalledWith('/mock/home/.oanim', {
      recursive: true,
      mode: 0o700,
    });
    expect(mockWriteFile).toHaveBeenCalled();
    const written = mockWriteFile.mock.calls[0][1] as string;
    expect(written).toContain('old_token');
    expect(written).toContain('new_key');
    expect(mockChmod).toHaveBeenCalledWith(
      '/mock/home/.oanim/credentials.yaml',
      0o600,
    );
  });
});

describe('clearCredentials', () => {
  it('writes empty object', async () => {
    await clearCredentials();
    expect(mockWriteFile).toHaveBeenCalled();
    const written = mockWriteFile.mock.calls[0][1] as string;
    expect(written).toContain('{}');
  });
});

describe('loadConfig', () => {
  it('returns config from yaml file', async () => {
    mockReadFile.mockResolvedValue('api_url: https://custom.api\n');
    const cfg = await loadConfig();
    expect(cfg).toEqual({ api_url: 'https://custom.api' });
  });

  it('returns empty object when file not found', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const cfg = await loadConfig();
    expect(cfg).toEqual({});
  });
});

describe('saveConfig', () => {
  it('merges new config with existing', async () => {
    mockReadFile.mockResolvedValue('api_url: https://old.api\n');
    await saveConfig({ api_url: 'https://new.api' });
    const written = mockWriteFile.mock.calls[0][1] as string;
    expect(written).toContain('https://new.api');
  });
});

describe('getApiUrl', () => {
  it('uses ANIMATE_API_URL env var first', async () => {
    process.env.ANIMATE_API_URL = 'https://env.api';
    const url = await getApiUrl();
    expect(url).toBe('https://env.api');
  });

  it('falls back to config file', async () => {
    mockReadFile.mockResolvedValue('api_url: https://config.api\n');
    const url = await getApiUrl();
    expect(url).toBe('https://config.api');
  });

  it('defaults to https://api.oanim.dev', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const url = await getApiUrl();
    expect(url).toBe('https://api.oanim.dev');
  });
});

describe('getAuth', () => {
  it('uses ANIMATE_API_KEY env var first', async () => {
    process.env.ANIMATE_API_KEY = 'env_key';
    const auth = await getAuth();
    expect(auth).toEqual({ type: 'api_key', value: 'env_key' });
  });

  it('falls back to credentials.yaml api_key', async () => {
    mockReadFile.mockResolvedValue('api_key: file_key\n');
    const auth = await getAuth();
    expect(auth).toEqual({ type: 'api_key', value: 'file_key' });
  });

  it('falls back to credentials.yaml token', async () => {
    mockReadFile.mockResolvedValue('token: file_token\n');
    const auth = await getAuth();
    expect(auth).toEqual({ type: 'token', value: 'file_token' });
  });

  it('returns null when no auth available', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const auth = await getAuth();
    expect(auth).toBeNull();
  });
});
