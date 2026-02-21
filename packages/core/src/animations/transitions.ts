import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';

// ─── Helpers ─────────────────────────────────────────────────────────

type EmptyProps = Record<string, unknown>;

// ─── fadeBlur ────────────────────────────────────────────────────────

const FadeBlurComponent: React.FC<TransitionPresentationComponentProps<EmptyProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const isEntering = presentationDirection === 'entering';
  const progress = isEntering ? presentationProgress : 1 - presentationProgress;
  const blur = interpolate(progress, [0, 1], [10, 0]);

  const style: React.CSSProperties = useMemo(
    () => ({ opacity: progress, filter: `blur(${blur}px)` }),
    [progress, blur],
  );

  return React.createElement(AbsoluteFill, { style }, children);
};

export function fadeBlur(): TransitionPresentation<EmptyProps> {
  return { component: FadeBlurComponent, props: {} };
}

// ─── scaleFade ───────────────────────────────────────────────────────

const ScaleFadeComponent: React.FC<TransitionPresentationComponentProps<EmptyProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const isEntering = presentationDirection === 'entering';
  const progress = isEntering ? presentationProgress : 1 - presentationProgress;
  const scale = interpolate(progress, [0, 1], [0.95, 1]);

  const style: React.CSSProperties = useMemo(
    () => ({ opacity: progress, transform: `scale(${scale})` }),
    [progress, scale],
  );

  return React.createElement(AbsoluteFill, { style }, children);
};

export function scaleFade(): TransitionPresentation<EmptyProps> {
  return { component: ScaleFadeComponent, props: {} };
}

// ─── clipCircle ──────────────────────────────────────────────────────

const ClipCircleComponent: React.FC<TransitionPresentationComponentProps<EmptyProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const isEntering = presentationDirection === 'entering';
  const progress = isEntering ? presentationProgress : 1 - presentationProgress;
  const radius = interpolate(progress, [0, 1], [0, 75]);

  const style: React.CSSProperties = useMemo(
    () => ({ clipPath: `circle(${radius}% at 50% 50%)` }),
    [radius],
  );

  return React.createElement(AbsoluteFill, { style }, children);
};

export function clipCircle(): TransitionPresentation<EmptyProps> {
  return { component: ClipCircleComponent, props: {} };
}

// ─── clipPolygon ─────────────────────────────────────────────────────

const ClipPolygonComponent: React.FC<TransitionPresentationComponentProps<EmptyProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const isEntering = presentationDirection === 'entering';
  const progress = isEntering ? presentationProgress : 1 - presentationProgress;
  const inset = interpolate(progress, [0, 1], [50, 0]);

  const style: React.CSSProperties = useMemo(
    () => ({
      clipPath: `polygon(${inset}% ${inset}%, ${100 - inset}% ${inset}%, ${100 - inset}% ${100 - inset}%, ${inset}% ${100 - inset}%)`,
    }),
    [inset],
  );

  return React.createElement(AbsoluteFill, { style }, children);
};

export function clipPolygon(): TransitionPresentation<EmptyProps> {
  return { component: ClipPolygonComponent, props: {} };
}

// ─── wipe ────────────────────────────────────────────────────────────

interface WipeProps extends Record<string, unknown> {
  direction?: 'left' | 'right' | 'up' | 'down';
}

const WipeComponent: React.FC<TransitionPresentationComponentProps<WipeProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const isEntering = presentationDirection === 'entering';
  const progress = isEntering ? presentationProgress : 1 - presentationProgress;
  const dir = passedProps.direction ?? 'left';

  const inset = interpolate(progress, [0, 1], [100, 0]);
  let clipPath: string;

  switch (dir) {
    case 'left':
      clipPath = `inset(0 ${inset}% 0 0)`;
      break;
    case 'right':
      clipPath = `inset(0 0 0 ${inset}%)`;
      break;
    case 'up':
      clipPath = `inset(0 0 ${inset}% 0)`;
      break;
    case 'down':
      clipPath = `inset(${inset}% 0 0 0)`;
      break;
  }

  const style: React.CSSProperties = useMemo(() => ({ clipPath }), [clipPath]);

  return React.createElement(AbsoluteFill, { style }, children);
};

export function wipe(
  props?: WipeProps,
): TransitionPresentation<WipeProps> {
  return { component: WipeComponent, props: props ?? {} };
}

// ─── splitHorizontal ─────────────────────────────────────────────────

const SplitHorizontalComponent: React.FC<
  TransitionPresentationComponentProps<EmptyProps>
> = ({ children, presentationDirection, presentationProgress }) => {
  const isEntering = presentationDirection === 'entering';
  const progress = isEntering ? presentationProgress : 1 - presentationProgress;
  const inset = interpolate(progress, [0, 1], [50, 0]);

  const style: React.CSSProperties = useMemo(
    () => ({ clipPath: `inset(${inset}% 0)` }),
    [inset],
  );

  return React.createElement(AbsoluteFill, { style }, children);
};

export function splitHorizontal(): TransitionPresentation<EmptyProps> {
  return { component: SplitHorizontalComponent, props: {} };
}

// ─── splitVertical ───────────────────────────────────────────────────

const SplitVerticalComponent: React.FC<
  TransitionPresentationComponentProps<EmptyProps>
> = ({ children, presentationDirection, presentationProgress }) => {
  const isEntering = presentationDirection === 'entering';
  const progress = isEntering ? presentationProgress : 1 - presentationProgress;
  const inset = interpolate(progress, [0, 1], [50, 0]);

  const style: React.CSSProperties = useMemo(
    () => ({ clipPath: `inset(0 ${inset}%)` }),
    [inset],
  );

  return React.createElement(AbsoluteFill, { style }, children);
};

export function splitVertical(): TransitionPresentation<EmptyProps> {
  return { component: SplitVerticalComponent, props: {} };
}

// ─── perspectiveFlip ─────────────────────────────────────────────────

const PerspectiveFlipComponent: React.FC<
  TransitionPresentationComponentProps<EmptyProps>
> = ({ children, presentationDirection, presentationProgress }) => {
  const isEntering = presentationDirection === 'entering';
  const rotateY = isEntering
    ? interpolate(presentationProgress, [0, 1], [90, 0])
    : interpolate(presentationProgress, [0, 1], [0, -90]);

  const style: React.CSSProperties = useMemo(
    () => ({
      transform: `perspective(1200px) rotateY(${rotateY}deg)`,
      backfaceVisibility: 'hidden' as const,
    }),
    [rotateY],
  );

  return React.createElement(AbsoluteFill, { style }, children);
};

export function perspectiveFlip(): TransitionPresentation<EmptyProps> {
  return { component: PerspectiveFlipComponent, props: {} };
}

// ─── morphExpand ─────────────────────────────────────────────────────

const MorphExpandComponent: React.FC<
  TransitionPresentationComponentProps<EmptyProps>
> = ({ children, presentationDirection, presentationProgress }) => {
  const isEntering = presentationDirection === 'entering';
  const progress = isEntering ? presentationProgress : 1 - presentationProgress;
  const scale = interpolate(progress, [0, 1], [0.3, 1]);
  const borderRadius = interpolate(progress, [0, 1], [50, 0]);

  const style: React.CSSProperties = useMemo(
    () => ({
      opacity: progress,
      transform: `scale(${scale})`,
      borderRadius: `${borderRadius}%`,
      overflow: 'hidden' as const,
    }),
    [progress, scale, borderRadius],
  );

  return React.createElement(AbsoluteFill, { style }, children);
};

export function morphExpand(): TransitionPresentation<EmptyProps> {
  return { component: MorphExpandComponent, props: {} };
}

// ─── zoomThrough ─────────────────────────────────────────────────────

const ZoomThroughComponent: React.FC<
  TransitionPresentationComponentProps<EmptyProps>
> = ({ children, presentationDirection, presentationProgress }) => {
  const isEntering = presentationDirection === 'entering';
  const scale = isEntering
    ? interpolate(presentationProgress, [0, 1], [0.5, 1])
    : interpolate(presentationProgress, [0, 1], [1, 2]);
  const opacity = isEntering ? presentationProgress : 1 - presentationProgress;

  const style: React.CSSProperties = useMemo(
    () => ({ opacity, transform: `scale(${scale})` }),
    [opacity, scale],
  );

  return React.createElement(AbsoluteFill, { style }, children);
};

export function zoomThrough(): TransitionPresentation<EmptyProps> {
  return { component: ZoomThroughComponent, props: {} };
}

// ─── pushLeft / pushRight ────────────────────────────────────────────

interface PushProps extends Record<string, unknown> {
  direction: 'left' | 'right';
}

const PushComponent: React.FC<TransitionPresentationComponentProps<PushProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const isEntering = presentationDirection === 'entering';
  const dir = passedProps.direction;
  const sign = dir === 'left' ? 1 : -1;

  const translateX = isEntering
    ? interpolate(presentationProgress, [0, 1], [sign * 100, 0])
    : interpolate(presentationProgress, [0, 1], [0, -sign * 100]);

  const style: React.CSSProperties = useMemo(
    () => ({ transform: `translateX(${translateX}%)` }),
    [translateX],
  );

  return React.createElement(AbsoluteFill, { style }, children);
};

export function pushLeft(): TransitionPresentation<PushProps> {
  return { component: PushComponent, props: { direction: 'left' } };
}

export function pushRight(): TransitionPresentation<PushProps> {
  return { component: PushComponent, props: { direction: 'right' } };
}

// ─── slideLeft / slideRight ──────────────────────────────────────────

interface SlideOpts extends Record<string, unknown> {
  direction: 'left' | 'right';
}

const SlideComponent: React.FC<TransitionPresentationComponentProps<SlideOpts>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const isEntering = presentationDirection === 'entering';
  if (!isEntering) {
    return React.createElement(AbsoluteFill, null, children);
  }
  const sign = passedProps.direction === 'left' ? 1 : -1;
  const translateX = interpolate(presentationProgress, [0, 1], [sign * 100, 0]);

  const style: React.CSSProperties = useMemo(
    () => ({ transform: `translateX(${translateX}%)` }),
    [translateX],
  );

  return React.createElement(AbsoluteFill, { style }, children);
};

export function slideLeft(): TransitionPresentation<SlideOpts> {
  return { component: SlideComponent, props: { direction: 'left' } };
}

export function slideRight(): TransitionPresentation<SlideOpts> {
  return { component: SlideComponent, props: { direction: 'right' } };
}
