import type { CSSProperties } from 'react';
import { interpolate } from 'remotion';
import { springValue, type AnimationContext } from './helpers';

/**
 * Element animation presets. Each returns CSSProperties for easy use:
 *   <div style={fadeUp({ frame, fps, delay: 0.3 })}>Hello</div>
 */

export function fadeUp(ctx: AnimationContext): CSSProperties {
  const progress = springValue({ ...ctx, spring: ctx.spring ?? 'snappy' });
  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
  };
}

export function fadeDown(ctx: AnimationContext): CSSProperties {
  const progress = springValue({ ...ctx, spring: ctx.spring ?? 'snappy' });
  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [-20, 0])}px)`,
  };
}

export function slideInLeft(ctx: AnimationContext): CSSProperties {
  const progress = springValue({ ...ctx, spring: ctx.spring ?? 'snappy' });
  return {
    opacity: progress,
    transform: `translateX(${interpolate(progress, [0, 1], [-30, 0])}px)`,
  };
}

export function slideInRight(ctx: AnimationContext): CSSProperties {
  const progress = springValue({ ...ctx, spring: ctx.spring ?? 'snappy' });
  return {
    opacity: progress,
    transform: `translateX(${interpolate(progress, [0, 1], [30, 0])}px)`,
  };
}

export function popIn(ctx: AnimationContext): CSSProperties {
  const progress = springValue({ ...ctx, spring: ctx.spring ?? 'bouncy' });
  return {
    opacity: progress,
    transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
  };
}

export function blurIn(ctx: AnimationContext): CSSProperties {
  const progress = springValue({ ...ctx, spring: ctx.spring ?? 'smooth' });
  const blur = interpolate(progress, [0, 1], [20, 0]);
  return {
    opacity: progress,
    filter: `blur(${blur}px)`,
  };
}

export function elasticScale(ctx: AnimationContext): CSSProperties {
  const progress = springValue({ ...ctx, spring: ctx.spring ?? 'wobbly' });
  return {
    transform: `scale(${interpolate(progress, [0, 1], [0, 1])})`,
  };
}

export function perspectiveRotateIn(ctx: AnimationContext): CSSProperties {
  const progress = springValue({ ...ctx, spring: ctx.spring ?? 'smooth' });
  const rotateX = interpolate(progress, [0, 1], [-60, 0]);
  return {
    opacity: progress,
    transform: `perspective(1000px) rotateX(${rotateX}deg)`,
    transformOrigin: 'center bottom',
  };
}
