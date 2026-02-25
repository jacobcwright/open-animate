import { describe, it, expect } from 'vitest';
import { easings } from '../../animations/easings';
import type { EasingPreset } from '../../animations/easings';

describe('easings', () => {
  const presetNames: EasingPreset[] = ['easeOut', 'circOut', 'easeInOut', 'backOut', 'expoOut'];

  it('exports all five easing presets', () => {
    expect(Object.keys(easings)).toEqual(presetNames);
  });

  for (const name of presetNames) {
    it(`${name} is a function`, () => {
      expect(typeof easings[name]).toBe('function');
    });

    it(`${name} maps 0 → ~0 and 1 → ~1`, () => {
      const fn = easings[name];
      expect(fn(0)).toBeCloseTo(0, 1);
      expect(fn(1)).toBeCloseTo(1, 1);
    });
  }

  it('easeOut progresses faster at the start', () => {
    const mid = easings.easeOut(0.5);
    expect(mid).toBeGreaterThan(0.5);
  });
});
