/**
 * Spring physics configurations for Remotion's spring() function.
 * Translated from Framer Motion spring presets to Remotion's config format.
 */
export const springs = {
  snappy: { mass: 1, damping: 30, stiffness: 400 },
  bouncy: { mass: 1, damping: 15, stiffness: 300 },
  gentle: { mass: 1, damping: 20, stiffness: 100 },
  stiff: { mass: 1, damping: 40, stiffness: 600 },
  wobbly: { mass: 1, damping: 10, stiffness: 200 },
  smooth: { mass: 1, damping: 25, stiffness: 120 },
  poppy: { mass: 1, damping: 22, stiffness: 500 },
} as const;

export type SpringPreset = keyof typeof springs;
