import React from 'react';
import { AbsoluteFill } from 'remotion';

interface VignetteProps {
  /** Intensity 0-1 */
  intensity?: number;
  /** Vignette color */
  color?: string;
}

/**
 * Radial gradient overlay for darkening edges and improving text readability.
 */
export const Vignette: React.FC<VignetteProps> = ({
  intensity = 0.6,
  color = '#000000',
}) => {
  return React.createElement(AbsoluteFill, {
    style: {
      background: `radial-gradient(ellipse at center, transparent 40%, ${color} 100%)`,
      opacity: intensity,
      pointerEvents: 'none',
    },
  });
};
