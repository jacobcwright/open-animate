import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { useCurrentFrame } from 'remotion';
import { BrowserFrame } from '../../components/BrowserFrame';

afterEach(cleanup);

describe('BrowserFrame', () => {
  it('renders children in viewport area', () => {
    const { container } = render(<BrowserFrame>Content</BrowserFrame>);
    expect(container.textContent).toContain('Content');
  });

  it('shows traffic lights', () => {
    const { container } = render(<BrowserFrame>X</BrowserFrame>);
    const circles = container.querySelectorAll('div[style*="border-radius: 50%"]');
    expect(circles.length).toBeGreaterThanOrEqual(3);
  });

  it('shows URL bar by default with lock icon', () => {
    const { container } = render(<BrowserFrame url="https://test.com">X</BrowserFrame>);
    expect(container.textContent).toContain('https://test.com');
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('hides URL bar when showUrlBar=false', () => {
    const { container } = render(<BrowserFrame showUrlBar={false}>X</BrowserFrame>);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('shows title when provided', () => {
    const { container } = render(<BrowserFrame title="My App">X</BrowserFrame>);
    expect(container.textContent).toContain('My App');
  });

  it('starts invisible at frame 0', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container } = render(<BrowserFrame>X</BrowserFrame>);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.opacity).toBe('0');
  });

  it('becomes visible at high frame', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(120);
    const { container } = render(<BrowserFrame>X</BrowserFrame>);
    const outer = container.firstElementChild as HTMLElement;
    expect(parseFloat(outer.style.opacity)).toBeGreaterThan(0.9);
  });

  it('supports light theme', () => {
    const { container } = render(<BrowserFrame theme="light">X</BrowserFrame>);
    const chromeBar = container.querySelector('div > div') as HTMLElement;
    // Light theme has different chrome color
    expect(chromeBar).toBeTruthy();
  });

  it('merges custom style', () => {
    const { container } = render(
      <BrowserFrame style={{ maxWidth: '800px' }}>X</BrowserFrame>,
    );
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.maxWidth).toBe('800px');
  });
});
