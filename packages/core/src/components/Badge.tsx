import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { springValue } from '../animations/helpers';
import type { SpringPreset } from '../animations/springs';

interface BadgeProps {
  children: React.ReactNode;
  delay?: number;
  spring?: SpringPreset;
  bg?: string;
  textColor?: string;
  borderColor?: string;
  fontSize?: number;
  style?: React.CSSProperties;
}

/**
 * Pill badge component with spring entrance.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  delay = 0,
  spring = 'poppy',
  bg = 'rgba(99, 102, 241, 0.15)',
  textColor = '#818cf8',
  borderColor = 'rgba(99, 102, 241, 0.3)',
  fontSize = 16,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = springValue({ frame, fps, delay, spring });

  return React.createElement(
    'span',
    {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 20px',
        borderRadius: 999,
        background: bg,
        border: `1px solid ${borderColor}`,
        color: textColor,
        fontSize,
        fontWeight: 500,
        letterSpacing: '0.02em',
        opacity: progress,
        transform: `scale(${0.8 + progress * 0.2})`,
        ...style,
      },
    },
    children,
  );
};
