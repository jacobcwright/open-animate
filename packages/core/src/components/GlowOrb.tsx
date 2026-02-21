import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface GlowOrbProps {
  color?: string;
  size?: number;
  x?: number;
  y?: number;
  /** Movement amplitude in px */
  drift?: number;
  /** Opacity 0-1 */
  opacity?: number;
}

/**
 * Animated blurred glow circle that drifts based on frame.
 */
export const GlowOrb: React.FC<GlowOrbProps> = ({
  color = 'rgba(99, 102, 241, 0.4)',
  size = 400,
  x = 50,
  y = 50,
  drift = 30,
  opacity = 0.6,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const style: React.CSSProperties = useMemo(() => {
    const cycle = (frame / (fps * 4)) * Math.PI * 2;
    const dx = Math.sin(cycle) * drift;
    const dy = Math.cos(cycle * 0.7) * drift;

    return {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      filter: `blur(${size * 0.3}px)`,
      left: `calc(${x}% - ${size / 2}px + ${dx}px)`,
      top: `calc(${y}% - ${size / 2}px + ${dy}px)`,
      opacity,
      pointerEvents: 'none',
    };
  }, [frame, fps, color, size, x, y, drift, opacity]);

  return React.createElement('div', { style });
};
