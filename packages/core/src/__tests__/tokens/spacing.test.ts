import { describe, it, expect } from 'vitest';
import { spacing } from '../../tokens/spacing';
import type { SpacingKey } from '../../tokens/spacing';

describe('spacing', () => {
  const expectedKeys: SpacingKey[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];

  it('exports all spacing keys', () => {
    expect(Object.keys(spacing)).toEqual(expectedKeys);
  });

  it('values are based on 4px increments', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(16);
  });

  it('values increase monotonically', () => {
    const values = Object.values(spacing);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});
