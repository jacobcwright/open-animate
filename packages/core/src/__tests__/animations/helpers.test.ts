import { describe, it, expect } from 'vitest';
import { springValue, springInterpolate } from '../../animations/helpers';

describe('springValue', () => {
  it('returns 0 at frame 0', () => {
    expect(springValue({ frame: 0, fps: 30 })).toBe(0);
  });

  it('converges toward 1 at high frame count', () => {
    const value = springValue({ frame: 120, fps: 30 });
    expect(value).toBeGreaterThan(0.95);
    expect(value).toBeLessThanOrEqual(1);
  });

  it('respects delay in seconds', () => {
    const withoutDelay = springValue({ frame: 10, fps: 30 });
    const withDelay = springValue({ frame: 10, fps: 30, delay: 1 });
    // At frame 10 with 1s delay (30 frames), adjusted frame is 0
    expect(withDelay).toBe(0);
    expect(withoutDelay).toBeGreaterThan(0);
  });

  it('uses specified spring preset', () => {
    const snappy = springValue({ frame: 10, fps: 30, spring: 'snappy' });
    const gentle = springValue({ frame: 10, fps: 30, spring: 'gentle' });
    // Different presets produce different values at the same frame
    expect(snappy).not.toBeCloseTo(gentle, 2);
  });

  it('defaults to snappy preset', () => {
    const defaultVal = springValue({ frame: 10, fps: 30 });
    const snappy = springValue({ frame: 10, fps: 30, spring: 'snappy' });
    expect(defaultVal).toBe(snappy);
  });
});

describe('springInterpolate', () => {
  it('maps to start of output range at frame 0', () => {
    const val = springInterpolate({ frame: 0, fps: 30 }, [50, 100]);
    expect(val).toBe(50);
  });

  it('maps to end of output range when spring is complete', () => {
    const val = springInterpolate({ frame: 120, fps: 30 }, [50, 100]);
    expect(val).toBeGreaterThan(97);
    expect(val).toBeLessThanOrEqual(100);
  });

  it('clamps to output range', () => {
    const val = springInterpolate({ frame: 120, fps: 30 }, [0, 100]);
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(100);
  });

  it('works with reversed output range', () => {
    const val = springInterpolate({ frame: 0, fps: 30 }, [100, 0]);
    expect(val).toBe(100);
  });
});
