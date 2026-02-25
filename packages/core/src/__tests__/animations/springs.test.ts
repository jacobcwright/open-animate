import { describe, it, expect } from 'vitest';
import { springs } from '../../animations/springs';
import type { SpringPreset } from '../../animations/springs';

describe('springs', () => {
  const presetNames: SpringPreset[] = [
    'snappy', 'bouncy', 'gentle', 'stiff', 'wobbly', 'smooth', 'poppy',
  ];

  it('exports all seven spring presets', () => {
    expect(Object.keys(springs)).toEqual(presetNames);
  });

  for (const name of presetNames) {
    it(`${name} has mass, damping, and stiffness`, () => {
      const config = springs[name];
      expect(config.mass).toBeGreaterThan(0);
      expect(config.damping).toBeGreaterThan(0);
      expect(config.stiffness).toBeGreaterThan(0);
    });
  }

  it('stiff has higher stiffness than gentle', () => {
    expect(springs.stiff.stiffness).toBeGreaterThan(springs.gentle.stiffness);
  });
});
