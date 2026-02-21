import React from 'react';
import { AbsoluteFill } from 'remotion';

interface SafeAreaProps {
  children: React.ReactNode;
  /**
   * 'title' = 80% inner area (10% padding each side)
   * 'action' = 90% inner area (5% padding each side)
   */
  mode?: 'title' | 'action';
  style?: React.CSSProperties;
}

/**
 * Broadcast-safe padding wrapper.
 * title-safe = 10% inset on all sides, action-safe = 5%.
 */
export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  mode = 'title',
  style,
}) => {
  const padding = mode === 'title' ? '10%' : '5%';

  return React.createElement(
    AbsoluteFill,
    {
      style: {
        padding,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      },
    },
    children,
  );
};
