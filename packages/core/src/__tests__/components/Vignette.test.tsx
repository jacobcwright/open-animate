import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Vignette } from '../../components/Vignette';

afterEach(cleanup);

describe('Vignette', () => {
  it('renders with default intensity and radial gradient', () => {
    const { container } = render(<Vignette />);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    expect(fill.style.opacity).toBe('0.6');
    expect(fill.style.background).toContain('radial-gradient');
  });

  it('applies custom intensity', () => {
    const { container } = render(<Vignette intensity={0.8} />);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    expect(fill.style.opacity).toBe('0.8');
  });

  it('applies custom color (appears in gradient)', () => {
    const { container } = render(<Vignette color="red" />);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    // jsdom normalizes: radial-gradient(..., red 100%)
    expect(fill.style.background).toContain('radial-gradient');
  });

  it('has pointerEvents none', () => {
    const { container } = render(<Vignette />);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    expect(fill.style.pointerEvents).toBe('none');
  });
});
