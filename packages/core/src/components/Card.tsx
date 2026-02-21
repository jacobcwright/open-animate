import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { springValue } from '../animations/helpers';
import type { SpringPreset } from '../animations/springs';

interface CardProps {
  children: React.ReactNode;
  /** Delay entrance animation (seconds) */
  delay?: number;
  spring?: SpringPreset;
  /** Background with glassmorphism */
  bg?: string;
  borderColor?: string;
  padding?: number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

/**
 * Glassmorphism card with backdrop blur and spring entrance.
 */
export const Card: React.FC<CardProps> = ({
  children,
  delay = 0,
  spring = 'snappy',
  bg = 'rgba(255, 255, 255, 0.05)',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  padding = 32,
  borderRadius = 16,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = springValue({ frame, fps, delay, spring });

  return React.createElement(
    'div',
    {
      style: {
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius,
        padding,
        backdropFilter: 'blur(20px)',
        opacity: progress,
        transform: `translateY(${(1 - progress) * 20}px)`,
        ...style,
      },
    },
    children,
  );
};
