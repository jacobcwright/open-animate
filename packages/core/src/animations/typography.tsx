import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { springs, type SpringPreset } from './springs';

// ─── AnimatedCharacters ──────────────────────────────────────────────

interface AnimatedCharactersProps {
  text: string;
  delay?: number;
  stagger?: number;
  spring?: SpringPreset;
  style?: React.CSSProperties;
}

/**
 * Staggered per-character entrance with spring physics.
 */
export const AnimatedCharacters: React.FC<AnimatedCharactersProps> = ({
  text,
  delay = 0,
  stagger = 0.03,
  spring: springPreset = 'snappy',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = text.split('');

  return React.createElement(
    'span',
    {
      style: {
        display: 'inline-flex',
        ...style,
      },
    },
    chars.map((char, i) => {
      const charDelay = delay + i * stagger;
      const delayFrames = Math.round(charDelay * fps);
      const adjustedFrame = Math.max(0, frame - delayFrames);

      const progress = spring({
        frame: adjustedFrame,
        fps,
        config: springs[springPreset],
      });

      const translateY = interpolate(progress, [0, 1], [20, 0]);
      const rotateX = interpolate(progress, [0, 1], [-40, 0]);

      return React.createElement(
        'span',
        {
          key: i,
          style: {
            display: 'inline-block',
            opacity: progress,
            transform: `perspective(800px) translateY(${translateY}px) rotateX(${rotateX}deg)`,
            whiteSpace: char === ' ' ? 'pre' : undefined,
          },
        },
        char,
      );
    }),
  );
};

// ─── TypewriterText ──────────────────────────────────────────────────

interface TypewriterTextProps {
  text: string;
  delay?: number;
  charsPerSecond?: number;
  showCursor?: boolean;
  cursorChar?: string;
  style?: React.CSSProperties;
}

/**
 * Character-by-character reveal with a blinking cursor.
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 0,
  charsPerSecond = 20,
  showCursor = true,
  cursorChar = '|',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayFrames = Math.round(delay * fps);
  const adjustedFrame = Math.max(0, frame - delayFrames);
  const framesPerChar = fps / charsPerSecond;
  const visibleChars = Math.min(
    text.length,
    Math.floor(adjustedFrame / framesPerChar),
  );

  const cursorVisible = Math.floor(frame / (fps * 0.5)) % 2 === 0;
  const isDone = visibleChars >= text.length;

  return React.createElement(
    'span',
    { style },
    text.slice(0, visibleChars),
    showCursor && (!isDone || cursorVisible)
      ? React.createElement(
          'span',
          { style: { opacity: cursorVisible ? 1 : 0 } },
          cursorChar,
        )
      : null,
  );
};

// ─── CountUp ─────────────────────────────────────────────────────────

interface CountUpProps {
  from?: number;
  to: number;
  delay?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: React.CSSProperties;
}

/**
 * Animated number counter using spring physics.
 */
export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  delay = 0,
  duration = 1,
  prefix = '',
  suffix = '',
  decimals = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayFrames = Math.round(delay * fps);
  const durationFrames = Math.round(duration * fps);
  const adjustedFrame = Math.max(0, frame - delayFrames);

  const progress = Math.min(1, adjustedFrame / durationFrames);
  const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

  const value = useMemo(() => {
    const current = from + (to - from) * easedProgress;
    return current.toFixed(decimals);
  }, [from, to, easedProgress, decimals]);

  return React.createElement('span', { style }, `${prefix}${value}${suffix}`);
};
