import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequest, MockHttpClient } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  const MockHttpClient = vi.fn(function () {
    return { request: mockRequest };
  });
  return { mockRequest, MockHttpClient };
});

vi.mock('../../lib/scene', () => ({
  loadScene: vi.fn(() =>
    Promise.resolve({
      name: 'Test',
      compositionId: 'Main',
      render: { fps: 30, width: 1920, height: 1080, codec: 'h264', crf: 18 },
      props: {},
    }),
  ),
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => true),
  statSync: vi.fn(() => ({ size: 5 * 1024 * 1024 })),
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

vi.mock('../../lib/config', () => ({
  getAuth: vi.fn(() => Promise.resolve({ type: 'api_key', value: 'key' })),
}));

vi.mock('../../lib/http', () => ({
  HttpClient: MockHttpClient,
}));

vi.mock('../../lib/cloud-render', () => ({
  submitCloudRender: vi.fn(() => Promise.resolve('job-123')),
  waitForRender: vi.fn(() => Promise.resolve({ status: 'done', progress: 1 })),
  downloadRenderOutput: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../lib/output', () => ({
  log: { error: vi.fn(), dim: vi.fn() },
  keyValue: vi.fn(),
}));

import { execSync } from 'node:child_process';
import { renderCommand } from '../../commands/render';
import { loadScene } from '../../lib/scene';
import { getAuth } from '../../lib/config';
import { submitCloudRender, waitForRender, downloadRenderOutput } from '../../lib/cloud-render';
import { log, keyValue } from '../../lib/output';
import ora from 'ora';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  // Reset loadScene to default
  vi.mocked(loadScene).mockResolvedValue({
    name: 'Test',
    compositionId: 'Main',
    render: { fps: 30, width: 1920, height: 1080, codec: 'h264', crf: 18 },
    props: {},
  });
  vi.mocked(getAuth).mockResolvedValue({ type: 'api_key', value: 'key' });
});

describe('render local', () => {
  it('renders with default config', async () => {
    await renderCommand.parseAsync([], { from: 'user' });

    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('npx remotion render Main out/Main.mp4'),
      expect.objectContaining({ stdio: 'inherit' }),
    );
  });

  it('uses output path override', async () => {
    await renderCommand.parseAsync(['--out', 'custom/out.mp4'], { from: 'user' });

    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('custom/out.mp4'),
      expect.any(Object),
    );
  });

  it('uses composition override', async () => {
    await renderCommand.parseAsync(['--composition', 'Intro'], { from: 'user' });

    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('Intro'),
      expect.any(Object),
    );
  });

  it('uses webm extension for vp8/vp9', async () => {
    vi.mocked(loadScene).mockResolvedValue({
      name: 'Test',
      compositionId: 'Main',
      render: { fps: 30, width: 1920, height: 1080, codec: 'vp9', crf: 18 },
      props: {},
    });

    await renderCommand.parseAsync([], { from: 'user' });

    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('.webm'),
      expect.any(Object),
    );
  });

  it('shows file info after render', async () => {
    await renderCommand.parseAsync([], { from: 'user' });

    expect(keyValue).toHaveBeenCalledWith(
      expect.objectContaining({
        Size: '5.0 MB',
        Resolution: '1920x1080',
        FPS: '30',
      }),
    );
  });

  it('fails on missing animate.json', async () => {
    vi.mocked(loadScene).mockRejectedValue(new Error('ENOENT'));
    vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);

    await expect(
      renderCommand.parseAsync([], { from: 'user' }),
    ).rejects.toThrow('process.exit(1)');

    const spinner = vi.mocked(ora)();
    expect(spinner.fail).toHaveBeenCalledWith(
      expect.stringContaining('No animate.json'),
    );
  });

  it('fails on invalid --props JSON', async () => {
    await renderCommand.parseAsync(['--props', 'not-json'], { from: 'user' });

    const spinner = vi.mocked(ora)();
    expect(spinner.fail).toHaveBeenCalledWith(expect.stringContaining('Invalid --props'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('parses resolution override', async () => {
    await renderCommand.parseAsync(['--res', '1280x720'], { from: 'user' });

    // Render still uses remotion CLI (resolution embedded in the config)
    // Just verify it doesn't fail
    expect(execSync).toHaveBeenCalled();
  });
});

describe('render --cloud', () => {
  it('submits cloud render and downloads result', async () => {
    await renderCommand.parseAsync(['--cloud'], { from: 'user' });

    expect(submitCloudRender).toHaveBeenCalled();
    expect(waitForRender).toHaveBeenCalledWith(
      expect.anything(),
      'job-123',
      expect.any(Function),
    );
    expect(downloadRenderOutput).toHaveBeenCalledWith(
      expect.anything(),
      'job-123',
      expect.stringContaining('.mp4'),
    );
  });

  it('fails when not authenticated', async () => {
    vi.mocked(getAuth).mockResolvedValue(null);

    await renderCommand.parseAsync(['--cloud'], { from: 'user' });

    const spinner = vi.mocked(ora)();
    expect(spinner.fail).toHaveBeenCalledWith(
      expect.stringContaining('requires authentication'),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('handles cloud render error', async () => {
    vi.mocked(submitCloudRender).mockRejectedValue(new Error('Upload failed'));

    await renderCommand.parseAsync(['--cloud'], { from: 'user' });

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Upload failed'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
