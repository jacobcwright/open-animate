import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { useCurrentFrame } from 'remotion';
import { GlowOrb } from '../../components/GlowOrb';

afterEach(cleanup);

describe('GlowOrb', () => {
  it('renders a div with default props', () => {
    const { container } = render(<GlowOrb />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.borderRadius).toBe('50%');
    expect(div.style.width).toBe('400px');
    expect(div.style.height).toBe('400px');
  });

  it('applies custom color and size', () => {
    const { container } = render(<GlowOrb color="red" size={200} />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.background).toBe('red');
    expect(div.style.width).toBe('200px');
    expect(div.style.height).toBe('200px');
  });

  it('positions at given x and y percentages', () => {
    const { container } = render(<GlowOrb x={30} y={70} />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.left).toContain('30%');
    expect(div.style.top).toContain('70%');
  });

  it('applies blur filter', () => {
    const { container } = render(<GlowOrb size={100} />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.filter).toContain('blur(');
  });

  it('drifts position based on frame', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container: c1 } = render(<GlowOrb />);
    const style1 = (c1.firstElementChild as HTMLElement).style.left;
    cleanup();

    vi.mocked(useCurrentFrame).mockReturnValue(30);
    const { container: c2 } = render(<GlowOrb />);
    const style2 = (c2.firstElementChild as HTMLElement).style.left;

    expect(style1).not.toBe(style2);
  });

  it('has pointer-events none', () => {
    const { container } = render(<GlowOrb />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.pointerEvents).toBe('none');
  });
});
