import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { useCurrentFrame } from 'remotion';
import { PhoneFrame } from '../../components/PhoneFrame';

afterEach(cleanup);

describe('PhoneFrame', () => {
  it('renders children', () => {
    const { container } = render(<PhoneFrame>Screen</PhoneFrame>);
    expect(container.textContent).toContain('Screen');
  });

  it('has 19.5:9 aspect ratio at default 390px width', () => {
    const { container } = render(<PhoneFrame>X</PhoneFrame>);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.width).toBe('390px');
    const expectedHeight = Math.round((390 * 19.5) / 9);
    expect(outer.style.height).toBe(`${expectedHeight}px`);
  });

  it('respects custom width', () => {
    const { container } = render(<PhoneFrame width={300}>X</PhoneFrame>);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.width).toBe('300px');
  });

  it('has dynamic island', () => {
    const { container } = render(<PhoneFrame>X</PhoneFrame>);
    // Dynamic island: rounded rectangle near top
    const island = container.querySelector('div[style*="border-radius: 18px"]');
    expect(island).toBeTruthy();
  });

  it('has home indicator', () => {
    const { container } = render(<PhoneFrame>X</PhoneFrame>);
    // Home indicator: thin bar at bottom
    const indicator = container.querySelector('div[style*="height: 5px"]');
    expect(indicator).toBeTruthy();
  });

  it('starts invisible at frame 0', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container } = render(<PhoneFrame>X</PhoneFrame>);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.opacity).toBe('0');
  });

  it('becomes visible at high frame', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(120);
    const { container } = render(<PhoneFrame>X</PhoneFrame>);
    const outer = container.firstElementChild as HTMLElement;
    expect(parseFloat(outer.style.opacity)).toBeGreaterThan(0.9);
  });

  it('supports light theme', () => {
    const { container } = render(<PhoneFrame theme="light">X</PhoneFrame>);
    const outer = container.firstElementChild as HTMLElement;
    // Light theme bezel is #f0f0f0
    expect(outer.style.background).toContain('rgb(240, 240, 240)');
  });

  it('merges custom style', () => {
    const { container } = render(
      <PhoneFrame style={{ margin: 'auto' }}>X</PhoneFrame>,
    );
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.margin).toBe('auto');
  });
});
