/**
 * Spacing scale in pixels for consistent layout.
 * Based on 4px base unit, scaled for 1920x1080 viewport.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128,
} as const;

export type SpacingKey = keyof typeof spacing;
