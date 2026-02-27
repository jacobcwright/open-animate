import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGw, MockMediaGateway } = vi.hoisted(() => {
  const mockGw = {
    generateImage: vi.fn(() => Promise.resolve()),
    editImage: vi.fn(() => Promise.resolve()),
    removeBackground: vi.fn(() => Promise.resolve()),
    upscaleImage: vi.fn(() => Promise.resolve()),
    run: vi.fn(() =>
      Promise.resolve({ url: 'https://cdn/result.mp4', estimatedCostUsd: 0.05, result: {} }),
    ),
  };
  const MockMediaGateway = vi.fn(function () {
    return mockGw;
  });
  return { mockGw, MockMediaGateway };
});

vi.mock('../../lib/gateway', () => ({
  MediaGateway: MockMediaGateway,
}));

vi.mock('../../lib/config', () => ({
  getAuth: vi.fn(() => Promise.resolve({ type: 'api_key', value: 'key' })),
}));

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn(() => Promise.resolve()),
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

vi.mock('../../lib/output', () => ({
  log: { error: vi.fn() },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { assetsCommand } from '../../commands/assets';
import { getAuth } from '../../lib/config';
import { writeFile } from 'node:fs/promises';
import { log } from '../../lib/output';
import ora from 'ora';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.mocked(getAuth).mockResolvedValue({ type: 'api_key', value: 'key' });
  mockFetch.mockResolvedValue({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  });
});

describe('assets gen-image', () => {
  it('generates image with prompt', async () => {
    await assetsCommand.parseAsync(
      ['gen-image', '--prompt', 'a cat', '--out', '/tmp/cat.png'],
      { from: 'user' },
    );

    expect(mockGw.generateImage).toHaveBeenCalledWith('a cat', '/tmp/cat.png', {
      model: undefined,
    });
    const spinner = vi.mocked(ora)();
    expect(spinner.succeed).toHaveBeenCalledWith(expect.stringContaining('/tmp/cat.png'));
  });

  it('passes custom model', async () => {
    await assetsCommand.parseAsync(
      ['gen-image', '--prompt', 'x', '--out', 'y', '--model', 'fal-ai/nano-banana-2'],
      { from: 'user' },
    );

    expect(mockGw.generateImage).toHaveBeenCalledWith('x', 'y', {
      model: 'fal-ai/nano-banana-2',
    });
  });

  it('fails when not authenticated', async () => {
    vi.mocked(getAuth).mockResolvedValue(null);
    delete process.env.ANIMATE_FAL_KEY;

    await assetsCommand.parseAsync(
      ['gen-image', '--prompt', 'test', '--out', 'out.png'],
      { from: 'user' },
    );

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

describe('assets edit-image', () => {
  it('edits image with prompt', async () => {
    await assetsCommand.parseAsync(
      ['edit-image', '--in', 'src.png', '--prompt', 'make blue', '--out', 'out.png'],
      { from: 'user' },
    );

    expect(mockGw.editImage).toHaveBeenCalledWith(
      'src.png',
      'make blue',
      'out.png',
      undefined,
    );
  });
});

describe('assets remove-bg', () => {
  it('removes background', async () => {
    await assetsCommand.parseAsync(
      ['remove-bg', '--in', 'photo.jpg', '--out', 'nobg.png'],
      { from: 'user' },
    );

    expect(mockGw.removeBackground).toHaveBeenCalledWith(
      'photo.jpg',
      'nobg.png',
      undefined,
    );
  });
});

describe('assets upscale', () => {
  it('upscales image', async () => {
    await assetsCommand.parseAsync(
      ['upscale', '--in', 'small.png', '--out', 'big.png'],
      { from: 'user' },
    );

    expect(mockGw.upscaleImage).toHaveBeenCalledWith(
      'small.png',
      'big.png',
      undefined,
    );
  });
});

describe('assets run', () => {
  it('runs model and shows JSON output', async () => {
    await assetsCommand.parseAsync(
      ['run', '--model', 'fal-ai/flux/schnell', '--input', '{"prompt":"test"}'],
      { from: 'user' },
    );

    expect(mockGw.run).toHaveBeenCalledWith('fal-ai/flux/schnell', { prompt: 'test' });
    expect(console.log).toHaveBeenCalled();
  });

  it('downloads result to file when --out specified', async () => {
    await assetsCommand.parseAsync(
      [
        'run',
        '--model',
        'fal-ai/kling',
        '--input',
        '{"prompt":"wave"}',
        '--out',
        'video.mp4',
      ],
      { from: 'user' },
    );

    expect(mockFetch).toHaveBeenCalledWith('https://cdn/result.mp4');
    expect(writeFile).toHaveBeenCalledWith('video.mp4', expect.any(Buffer));
  });

  it('fails on invalid --input JSON', async () => {
    await assetsCommand.parseAsync(
      ['run', '--model', 'test', '--input', 'not-json'],
      { from: 'user' },
    );

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Invalid --input'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('handles gateway error', async () => {
    mockGw.run.mockRejectedValue(new Error('Model timeout'));

    await assetsCommand.parseAsync(
      ['run', '--model', 'test', '--input', '{}'],
      { from: 'user' },
    );

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Model timeout'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
