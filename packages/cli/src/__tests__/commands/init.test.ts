import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(() => Promise.resolve()),
  writeFile: vi.fn(() => Promise.resolve()),
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('ora', () => {
  const spinner: Record<string, unknown> = {
    start: vi.fn(() => spinner),
    stop: vi.fn(),
    fail: vi.fn(),
    succeed: vi.fn(),
    warn: vi.fn(),
    text: '',
  };
  return { default: vi.fn(() => spinner) };
});

vi.mock('../../lib/output', () => ({
  log: { success: vi.fn(), error: vi.fn(), dim: vi.fn() },
  keyValue: vi.fn(),
  splashBanner: vi.fn(),
}));

import { mkdir, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { initCommand } from '../../commands/init';
import { log, keyValue, splashBanner } from '../../lib/output';
import ora from 'ora';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('init command', () => {
  it('scaffolds project with default name', async () => {
    await initCommand.parseAsync([], { from: 'user' });

    expect(splashBanner).toHaveBeenCalled();
    expect(mkdir).toHaveBeenCalledWith(
      expect.stringContaining('my-video/src'),
      { recursive: true },
    );
    expect(mkdir).toHaveBeenCalledWith(
      expect.stringContaining('my-video/public'),
      { recursive: true },
    );
  });

  it('creates all required files', async () => {
    await initCommand.parseAsync([], { from: 'user' });

    const writeCalls = vi.mocked(writeFile).mock.calls.map((c) => String(c[0]));
    expect(writeCalls).toEqual(
      expect.arrayContaining([
        expect.stringContaining('package.json'),
        expect.stringContaining('tsconfig.json'),
        expect.stringContaining('index.ts'),
        expect.stringContaining('Root.tsx'),
        expect.stringContaining('MyComp.tsx'),
        expect.stringContaining('animate.json'),
      ]),
    );
  });

  it('uses custom project name', async () => {
    await initCommand.parseAsync(['cool-video'], { from: 'user' });

    expect(mkdir).toHaveBeenCalledWith(
      expect.stringContaining('cool-video/src'),
      { recursive: true },
    );
    expect(log.success).toHaveBeenCalledWith(expect.stringContaining('cool-video'));
  });

  it('runs package manager install', async () => {
    await initCommand.parseAsync([], { from: 'user' });

    // execSync is called first for detectPm (pnpm --version), then for install
    expect(execSync).toHaveBeenCalledWith('pnpm --version', expect.any(Object));
    expect(execSync).toHaveBeenCalledWith('pnpm install', expect.any(Object));
  });

  it('warns when install fails', async () => {
    // detectPm succeeds (pnpm), but install fails
    vi.mocked(execSync)
      .mockImplementationOnce(() => Buffer.from('')) // pnpm --version
      .mockImplementationOnce(() => {
        throw new Error('install failed');
      }); // pnpm install

    await initCommand.parseAsync([], { from: 'user' });

    const spinner = vi.mocked(ora)();
    expect(spinner.warn).toHaveBeenCalledWith(
      expect.stringContaining('Could not auto-install'),
    );
  });

  it('shows next steps after scaffolding', async () => {
    await initCommand.parseAsync([], { from: 'user' });

    expect(keyValue).toHaveBeenCalledWith(
      expect.objectContaining({
        Preview: expect.stringContaining('remotion studio'),
        Render: expect.stringContaining('oanim render'),
      }),
    );
  });

  it('handles scaffold error', async () => {
    vi.mocked(mkdir).mockRejectedValue(new Error('EACCES'));

    await initCommand.parseAsync([], { from: 'user' });

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('EACCES'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
