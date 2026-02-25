import { describe, it, expect } from 'vitest';
import { palettes } from '../../tokens/colors';
import type { ColorPalette, PaletteName } from '../../tokens/colors';

describe('palettes', () => {
  const paletteNames: PaletteName[] = ['dark', 'light', 'midnight', 'sunset', 'ocean'];

  it('exports all five palettes', () => {
    expect(Object.keys(palettes)).toEqual(paletteNames);
  });

  const requiredKeys: (keyof ColorPalette)[] = [
    'primary', 'secondary', 'accent', 'bg', 'bgAlt', 'text', 'textMuted',
  ];

  for (const name of paletteNames) {
    it(`${name} palette has all required color keys`, () => {
      const palette = palettes[name];
      for (const key of requiredKeys) {
        expect(palette[key]).toMatch(/^#|^rgba?\(/);
      }
    });
  }

  it('palette values are distinct across themes', () => {
    expect(palettes.dark.bg).not.toBe(palettes.light.bg);
  });
});
