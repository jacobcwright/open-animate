import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock Remotion hooks and AbsoluteFill — keep real math functions (spring, interpolate, Easing)
vi.mock('remotion', async () => {
  const actual = await vi.importActual<typeof import('remotion')>('remotion');
  return {
    ...actual,
    useCurrentFrame: vi.fn(() => 0),
    useVideoConfig: vi.fn(() => ({
      fps: 30,
      width: 1920,
      height: 1080,
      durationInFrames: 150,
      id: 'test',
      defaultProps: {},
      props: {},
      defaultCodec: 'h264' as const,
    })),
    AbsoluteFill: ({ children, style, ...props }: any) => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'absolute-fill', style, ...props }, children);
    },
  };
});
