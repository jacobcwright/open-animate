import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import {
  fadeBlur,
  scaleFade,
  clipCircle,
  clipPolygon,
  wipe,
  splitHorizontal,
  splitVertical,
  perspectiveFlip,
  morphExpand,
  zoomThrough,
  pushLeft,
  pushRight,
  slideLeft,
  slideRight,
} from '../../animations/transitions';

afterEach(cleanup);

// Helper: render a transition component and return the AbsoluteFill wrapper
function renderTransition(
  Component: React.FC<any>,
  props: Record<string, unknown>,
  direction: 'entering' | 'exiting',
  progress: number,
) {
  const { container } = render(
    React.createElement(Component, {
      presentationDirection: direction,
      presentationProgress: progress,
      passedProps: props,
      children: React.createElement('div', null, 'content'),
    }),
  );
  return container.firstElementChild as HTMLElement;
}

describe('fadeBlur', () => {
  it('returns component and empty props', () => {
    const result = fadeBlur();
    expect(result.component).toBeDefined();
    expect(result.props).toEqual({});
  });

  it('renders entering at progress 0 with blur', () => {
    const { component: C } = fadeBlur();
    const el = renderTransition(C, {}, 'entering', 0);
    expect(el.style.opacity).toBe('0');
    expect(el.style.filter).toContain('blur(10px)');
  });

  it('renders entering at progress 1 with no blur', () => {
    const { component: C } = fadeBlur();
    const el = renderTransition(C, {}, 'entering', 1);
    expect(el.style.opacity).toBe('1');
    expect(el.style.filter).toContain('blur(0px)');
  });

  it('renders exiting (reverses progress)', () => {
    const { component: C } = fadeBlur();
    const el = renderTransition(C, {}, 'exiting', 0);
    expect(el.style.opacity).toBe('1');
  });
});

describe('scaleFade', () => {
  it('returns component and empty props', () => {
    const result = scaleFade();
    expect(result.component).toBeDefined();
    expect(result.props).toEqual({});
  });

  it('entering at 0 has reduced scale and no opacity', () => {
    const { component: C } = scaleFade();
    const el = renderTransition(C, {}, 'entering', 0);
    expect(el.style.opacity).toBe('0');
    expect(el.style.transform).toContain('scale(0.95)');
  });
});

describe('clipCircle', () => {
  it('entering at 0 has 0% radius circle clip', () => {
    const { component: C } = clipCircle();
    const el = renderTransition(C, {}, 'entering', 0);
    expect(el.style.clipPath).toContain('circle(0%');
  });

  it('entering at 1 has 75% radius', () => {
    const { component: C } = clipCircle();
    const el = renderTransition(C, {}, 'entering', 1);
    expect(el.style.clipPath).toContain('circle(75%');
  });
});

describe('clipPolygon', () => {
  it('entering at 0 clips to center point', () => {
    const { component: C } = clipPolygon();
    const el = renderTransition(C, {}, 'entering', 0);
    expect(el.style.clipPath).toContain('polygon(50% 50%');
  });

  it('entering at 1 clips to full viewport', () => {
    const { component: C } = clipPolygon();
    const el = renderTransition(C, {}, 'entering', 1);
    expect(el.style.clipPath).toContain('polygon(0% 0%');
  });
});

describe('wipe', () => {
  it('defaults to left direction', () => {
    const { component: C, props } = wipe();
    const el = renderTransition(C, props, 'entering', 0);
    expect(el.style.clipPath).toContain('inset(0 100% 0 0)');
  });

  it('supports right direction', () => {
    const { component: C, props } = wipe({ direction: 'right' });
    const el = renderTransition(C, props, 'entering', 0);
    expect(el.style.clipPath).toContain('inset(0 0 0 100%)');
  });

  it('supports up direction', () => {
    const { component: C, props } = wipe({ direction: 'up' });
    const el = renderTransition(C, props, 'entering', 0);
    expect(el.style.clipPath).toContain('inset(0 0 100% 0)');
  });

  it('supports down direction', () => {
    const { component: C, props } = wipe({ direction: 'down' });
    const el = renderTransition(C, props, 'entering', 0);
    expect(el.style.clipPath).toContain('inset(100% 0 0 0)');
  });
});

describe('splitHorizontal', () => {
  it('entering at 0 clips to center horizontal line', () => {
    const { component: C } = splitHorizontal();
    const el = renderTransition(C, {}, 'entering', 0);
    expect(el.style.clipPath).toContain('inset(50% 0)');
  });

  it('entering at 1 has no clip', () => {
    const { component: C } = splitHorizontal();
    const el = renderTransition(C, {}, 'entering', 1);
    expect(el.style.clipPath).toContain('inset(0% 0)');
  });
});

describe('splitVertical', () => {
  it('entering at 0 clips to center vertical line', () => {
    const { component: C } = splitVertical();
    const el = renderTransition(C, {}, 'entering', 0);
    expect(el.style.clipPath).toContain('inset(0 50%)');
  });
});

describe('perspectiveFlip', () => {
  it('entering at 0 is rotated 90deg', () => {
    const { component: C } = perspectiveFlip();
    const el = renderTransition(C, {}, 'entering', 0);
    expect(el.style.transform).toContain('rotateY(90deg)');
    expect(el.style.backfaceVisibility).toBe('hidden');
  });

  it('exiting at 1 rotates to -90deg', () => {
    const { component: C } = perspectiveFlip();
    const el = renderTransition(C, {}, 'exiting', 1);
    expect(el.style.transform).toContain('rotateY(-90deg)');
  });
});

describe('morphExpand', () => {
  it('entering at 0 is small with border radius', () => {
    const { component: C } = morphExpand();
    const el = renderTransition(C, {}, 'entering', 0);
    expect(el.style.opacity).toBe('0');
    expect(el.style.transform).toContain('scale(0.3)');
    expect(el.style.borderRadius).toContain('50%');
  });
});

describe('zoomThrough', () => {
  it('entering starts at half scale', () => {
    const { component: C } = zoomThrough();
    const el = renderTransition(C, {}, 'entering', 0);
    expect(el.style.opacity).toBe('0');
    expect(el.style.transform).toContain('scale(0.5)');
  });

  it('exiting zooms to double scale', () => {
    const { component: C } = zoomThrough();
    const el = renderTransition(C, {}, 'exiting', 1);
    expect(el.style.opacity).toBe('0');
    expect(el.style.transform).toContain('scale(2)');
  });
});

describe('pushLeft', () => {
  it('returns component with direction left', () => {
    const result = pushLeft();
    expect(result.props).toEqual({ direction: 'left' });
  });

  it('entering at 0 translates from right', () => {
    const { component: C, props } = pushLeft();
    const el = renderTransition(C, props, 'entering', 0);
    expect(el.style.transform).toContain('translateX(100%)');
  });

  it('exiting moves left', () => {
    const { component: C, props } = pushLeft();
    const el = renderTransition(C, props, 'exiting', 1);
    expect(el.style.transform).toContain('translateX(-100%)');
  });
});

describe('pushRight', () => {
  it('returns component with direction right', () => {
    const result = pushRight();
    expect(result.props).toEqual({ direction: 'right' });
  });

  it('entering at 0 translates from left', () => {
    const { component: C, props } = pushRight();
    const el = renderTransition(C, props, 'entering', 0);
    expect(el.style.transform).toContain('translateX(-100%)');
  });
});

describe('slideLeft', () => {
  it('entering at 0 slides in from right', () => {
    const { component: C, props } = slideLeft();
    const el = renderTransition(C, props, 'entering', 0);
    expect(el.style.transform).toContain('translateX(100%)');
  });

  it('exiting renders children without transform', () => {
    const { component: C, props } = slideLeft();
    const el = renderTransition(C, props, 'exiting', 0.5);
    expect(el.style.transform).toBe('');
  });
});

describe('slideRight', () => {
  it('entering at 0 slides in from left', () => {
    const { component: C, props } = slideRight();
    const el = renderTransition(C, props, 'entering', 0);
    expect(el.style.transform).toContain('translateX(-100%)');
  });
});
