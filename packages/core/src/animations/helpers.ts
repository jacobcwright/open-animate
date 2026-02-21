import { spring, interpolate } from 'remotion';
import { springs, type SpringPreset } from './springs';

export interface AnimationContext {
  frame: number;
  fps: number;
  delay?: number;
  spring?: SpringPreset;
}

/**
 * Compute a spring-driven 0→1 value with optional delay (in seconds).
 */
export function springValue(ctx: AnimationContext): number {
  const { frame, fps, delay = 0, spring: preset = 'snappy' } = ctx;
  const delayFrames = Math.round(delay * fps);
  const adjustedFrame = Math.max(0, frame - delayFrames);

  return spring({
    frame: adjustedFrame,
    fps,
    config: springs[preset],
  });
}

/**
 * Compute an interpolated value from 0→1 input range to a custom output range,
 * driven by a spring.
 */
export function springInterpolate(
  ctx: AnimationContext,
  outputRange: [number, number],
): number {
  const value = springValue(ctx);
  return interpolate(value, [0, 1], outputRange, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}
