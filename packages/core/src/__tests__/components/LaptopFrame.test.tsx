import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { useCurrentFrame } from 'remotion';
import { LaptopFrame } from '../../components/LaptopFrame';

afterEach(cleanup);

describe('LaptopFrame', () => {
  it('renders children in screen area', () => {
    const { container } = render(<LaptopFrame>Screen Content</LaptopFrame>);
    expect(container.textContent).toContain('Screen Content');
  });

  it('has camera dot', () => {
    const { container } = render(<LaptopFrame>X</LaptopFrame>);
    // Camera dot: 6px circle
    const cameraDot = container.querySelector('div[style*="width: 6px"]');
    expect(cameraDot).toBeTruthy();
  });

  it('has keyboard base', () => {
    const { container } = render(<LaptopFrame>X</LaptopFrame>);
    // Base: uses clipPath for wedge shape
    const base = container.querySelector('div[style*="clip-path"]');
    expect(base).toBeTruthy();
  });

  it('starts invisible at frame 0', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container } = render(<LaptopFrame>X</LaptopFrame>);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.opacity).toBe('0');
  });

  it('becomes visible at high frame', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(120);
    const { container } = render(<LaptopFrame>X</LaptopFrame>);
    const outer = container.firstElementChild as HTMLElement;
    expect(parseFloat(outer.style.opacity)).toBeGreaterThan(0.9);
  });

  it('supports light theme', () => {
    const { container } = render(<LaptopFrame theme="light">X</LaptopFrame>);
    const outer = container.firstElementChild as HTMLElement;
    // Light theme changes colors — just verify it renders
    expect(outer).toBeTruthy();
  });

  it('respects custom width', () => {
    const { container } = render(<LaptopFrame width={600}>X</LaptopFrame>);
    // Content width should be 600, screen width is 600 + bezel*2
    const screenDiv = container.querySelector('div[style*="width: 640px"]');
    expect(screenDiv).toBeTruthy();
  });

  it('merges custom style', () => {
    const { container } = render(
      <LaptopFrame style={{ margin: '20px' }}>X</LaptopFrame>,
    );
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.margin).toBe('20px');
  });
});
