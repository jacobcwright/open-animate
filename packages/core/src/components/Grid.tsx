import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

interface GridProps {
  /** Grid cell size in px */
  cellSize?: number;
  /** Grid line color */
  color?: string;
  /** Grid line width */
  lineWidth?: number;
  /** Animate slow drift */
  animated?: boolean;
}

/**
 * Subtle animated grid background pattern.
 */
export const Grid: React.FC<GridProps> = ({
  cellSize = 60,
  color = 'rgba(255, 255, 255, 0.03)',
  lineWidth = 1,
  animated = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const style: React.CSSProperties = useMemo(() => {
    const offset = animated ? (frame / fps) * 5 : 0;

    return {
      position: 'absolute',
      inset: -cellSize,
      backgroundImage: `
        linear-gradient(${color} ${lineWidth}px, transparent ${lineWidth}px),
        linear-gradient(90deg, ${color} ${lineWidth}px, transparent ${lineWidth}px)
      `,
      backgroundSize: `${cellSize}px ${cellSize}px`,
      transform: `translate(${offset % cellSize}px, ${offset % cellSize}px)`,
      pointerEvents: 'none',
    };
  }, [frame, fps, cellSize, color, lineWidth, animated]);

  return React.createElement('div', { style });
};
