import React from 'react';
import { AbsoluteFill } from 'remotion';

interface BackgroundProps {
  /** CSS gradient string, e.g. 'linear-gradient(135deg, #0a0a0a, #1a1a2e)' */
  gradient?: string;
  /** Solid color fallback */
  color?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Full-bleed gradient background layer.
 */
export const Background: React.FC<BackgroundProps> = ({
  gradient,
  color = '#0a0a0a',
  children,
  style,
}) => {
  return React.createElement(
    AbsoluteFill,
    {
      style: {
        background: gradient ?? color,
        ...style,
      },
    },
    children,
  );
};
