import { describe, it, expect } from 'vitest';
import {
  fadeUp,
  fadeDown,
  slideInLeft,
  slideInRight,
  popIn,
  blurIn,
  elasticScale,
  perspectiveRotateIn,
} from '../../animations/elements';

const ctx = { frame: 0, fps: 30 };
const ctxMid = { frame: 15, fps: 30 };
const ctxEnd = { frame: 120, fps: 30 };

describe('fadeUp', () => {
  it('starts invisible and translated down', () => {
    const style = fadeUp(ctx);
    expect(style.opacity).toBe(0);
    expect(style.transform).toContain('translateY(20px)');
  });

  it('ends visible at translateY(0)', () => {
    const style = fadeUp(ctxEnd);
    expect(style.opacity).toBeGreaterThan(0.95);
    expect(style.transform).toContain('translateY(');
  });

  it('uses specified spring preset', () => {
    const gentle = fadeUp({ ...ctxMid, spring: 'gentle' });
    const stiff = fadeUp({ ...ctxMid, spring: 'stiff' });
    expect(gentle.opacity).not.toBe(stiff.opacity);
  });
});

describe('fadeDown', () => {
  it('starts with negative Y translation', () => {
    const style = fadeDown(ctx);
    expect(style.opacity).toBe(0);
    expect(style.transform).toContain('translateY(-20px)');
  });
});

describe('slideInLeft', () => {
  it('starts translated left', () => {
    const style = slideInLeft(ctx);
    expect(style.opacity).toBe(0);
    expect(style.transform).toContain('translateX(-30px)');
  });

  it('ends at translateX near 0', () => {
    const style = slideInLeft(ctxEnd);
    expect(style.opacity).toBeGreaterThan(0.95);
  });
});

describe('slideInRight', () => {
  it('starts translated right', () => {
    const style = slideInRight(ctx);
    expect(style.transform).toContain('translateX(30px)');
  });
});

describe('popIn', () => {
  it('starts small and invisible', () => {
    const style = popIn(ctx);
    expect(style.opacity).toBe(0);
    expect(style.transform).toContain('scale(0.5)');
  });

  it('defaults to bouncy spring', () => {
    const defaultStyle = popIn(ctxMid);
    const bouncy = popIn({ ...ctxMid, spring: 'bouncy' });
    expect(defaultStyle.opacity).toBe(bouncy.opacity);
  });
});

describe('blurIn', () => {
  it('starts blurred', () => {
    const style = blurIn(ctx);
    expect(style.opacity).toBe(0);
    expect(style.filter).toContain('blur(20px)');
  });

  it('ends with no blur', () => {
    const style = blurIn(ctxEnd);
    expect(style.filter).toContain('blur(');
    expect(style.opacity).toBeGreaterThan(0.95);
  });

  it('defaults to smooth spring', () => {
    const defaultStyle = blurIn(ctxMid);
    const smooth = blurIn({ ...ctxMid, spring: 'smooth' });
    expect(defaultStyle.opacity).toBe(smooth.opacity);
  });
});

describe('elasticScale', () => {
  it('starts at scale 0', () => {
    const style = elasticScale(ctx);
    expect(style.transform).toContain('scale(0)');
  });

  it('ends near scale 1', () => {
    const style = elasticScale(ctxEnd);
    expect(style.transform).toContain('scale(');
  });

  it('defaults to wobbly spring', () => {
    const defaultStyle = elasticScale(ctxMid);
    const wobbly = elasticScale({ ...ctxMid, spring: 'wobbly' });
    expect(defaultStyle.transform).toBe(wobbly.transform);
  });
});

describe('perspectiveRotateIn', () => {
  it('starts rotated with perspective', () => {
    const style = perspectiveRotateIn(ctx);
    expect(style.opacity).toBe(0);
    expect(style.transform).toContain('perspective(1000px)');
    expect(style.transform).toContain('rotateX(-60deg)');
    expect(style.transformOrigin).toBe('center bottom');
  });

  it('ends at rotateX near 0', () => {
    const style = perspectiveRotateIn(ctxEnd);
    expect(style.opacity).toBeGreaterThan(0.95);
  });

  it('defaults to smooth spring', () => {
    const defaultStyle = perspectiveRotateIn(ctxMid);
    const smooth = perspectiveRotateIn({ ...ctxMid, spring: 'smooth' });
    expect(defaultStyle.opacity).toBe(smooth.opacity);
  });
});
