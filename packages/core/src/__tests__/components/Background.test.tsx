import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Background } from '../../components/Background';

afterEach(cleanup);

describe('Background', () => {
  it('renders with default color', () => {
    const { container } = render(<Background />);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    // jsdom normalizes hex to rgb
    expect(fill.style.background).toContain('rgb(10, 10, 10)');
  });

  it('uses gradient when provided', () => {
    const grad = 'linear-gradient(135deg, #000, #fff)';
    const { container } = render(<Background gradient={grad} />);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    expect(fill.style.background).toContain('linear-gradient');
  });

  it('uses custom color', () => {
    const { container } = render(<Background color="#ff0000" />);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    expect(fill.style.background).toContain('rgb(255, 0, 0)');
  });

  it('gradient overrides color', () => {
    const grad = 'linear-gradient(#000, #fff)';
    const { container } = render(<Background gradient={grad} color="red" />);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    expect(fill.style.background).toContain('linear-gradient');
  });

  it('renders children', () => {
    const { container } = render(<Background><span>child</span></Background>);
    expect(container.textContent).toBe('child');
  });

  it('merges custom style', () => {
    const { container } = render(<Background style={{ zIndex: '1' }} />);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    expect(fill.style.zIndex).toBe('1');
  });
});
