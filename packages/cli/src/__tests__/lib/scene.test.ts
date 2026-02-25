import { describe, it, expect, vi } from 'vitest';
import { sceneSchema, loadScene } from '../../lib/scene';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

import { readFile } from 'node:fs/promises';
const mockReadFile = vi.mocked(readFile);

describe('sceneSchema', () => {
  it('parses a valid config', () => {
    const config = {
      name: 'My Video',
      compositionId: 'Main',
      render: { fps: 60, width: 1920, height: 1080, codec: 'h264', crf: 18 },
      props: { title: 'Hello' },
    };
    const parsed = sceneSchema.parse(config);
    expect(parsed.name).toBe('My Video');
    expect(parsed.compositionId).toBe('Main');
    expect(parsed.render.fps).toBe(60);
    expect(parsed.props).toEqual({ title: 'Hello' });
  });

  it('applies defaults for render settings', () => {
    const config = {
      name: 'Test',
      compositionId: 'Comp',
      render: {},
    };
    const parsed = sceneSchema.parse(config);
    expect(parsed.render.fps).toBe(30);
    expect(parsed.render.width).toBe(1920);
    expect(parsed.render.height).toBe(1080);
    expect(parsed.render.codec).toBe('h264');
    expect(parsed.render.crf).toBe(18);
    expect(parsed.props).toEqual({});
  });

  it('rejects invalid codec', () => {
    const config = {
      name: 'Test',
      compositionId: 'Comp',
      render: { codec: 'av1' },
    };
    expect(() => sceneSchema.parse(config)).toThrow();
  });

  it('accepts all valid codecs', () => {
    for (const codec of ['h264', 'h265', 'vp8', 'vp9']) {
      const config = {
        name: 'Test',
        compositionId: 'Comp',
        render: { codec },
      };
      expect(sceneSchema.parse(config).render.codec).toBe(codec);
    }
  });

  it('rejects missing name', () => {
    expect(() =>
      sceneSchema.parse({ compositionId: 'X', render: {} }),
    ).toThrow();
  });

  it('rejects missing compositionId', () => {
    expect(() =>
      sceneSchema.parse({ name: 'X', render: {} }),
    ).toThrow();
  });
});

describe('loadScene', () => {
  it('reads and parses animate.json from directory', async () => {
    const config = {
      name: 'Video',
      compositionId: 'Main',
      render: { fps: 30 },
    };
    mockReadFile.mockResolvedValue(JSON.stringify(config));

    const scene = await loadScene('/project');
    expect(scene.name).toBe('Video');
    expect(scene.compositionId).toBe('Main');
    expect(mockReadFile).toHaveBeenCalledWith(
      expect.stringContaining('animate.json'),
      'utf-8',
    );
  });

  it('defaults to current directory', async () => {
    const config = {
      name: 'V',
      compositionId: 'C',
      render: {},
    };
    mockReadFile.mockResolvedValue(JSON.stringify(config));

    await loadScene();
    expect(mockReadFile).toHaveBeenCalledWith(
      expect.stringContaining('animate.json'),
      'utf-8',
    );
  });

  it('throws on invalid JSON', async () => {
    mockReadFile.mockResolvedValue('not json');
    await expect(loadScene('/project')).rejects.toThrow();
  });

  it('throws on file not found', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    await expect(loadScene('/project')).rejects.toThrow();
  });
});
