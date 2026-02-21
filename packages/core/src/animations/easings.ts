import { Easing } from 'remotion';

/**
 * Named easing presets wrapping Remotion's Easing API.
 * Use with interpolate()'s easing option.
 */
export const easings = {
  easeOut: Easing.bezier(0.16, 1, 0.3, 1),
  circOut: Easing.out(Easing.circle),
  easeInOut: Easing.bezier(0.4, 0, 0.2, 1),
  backOut: Easing.out(Easing.back(1.7)),
  expoOut: Easing.out(Easing.exp),
} as const;

export type EasingPreset = keyof typeof easings;
