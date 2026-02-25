import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { useCurrentFrame } from 'remotion';
import { Badge } from '../../components/Badge';

afterEach(cleanup);

describe('Badge', () => {
  it('renders children', () => {
    const { container } = render(<Badge>New</Badge>);
    expect(container.textContent).toBe('New');
  });

  it('starts invisible at frame 0', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container } = render(<Badge>X</Badge>);
    const span = container.firstElementChild as HTMLElement;
    expect(span.style.opacity).toBe('0');
  });

  it('becomes visible at high frame', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(120);
    const { container } = render(<Badge>X</Badge>);
    const span = container.firstElementChild as HTMLElement;
    expect(parseFloat(span.style.opacity)).toBeGreaterThan(0.9);
  });

  it('has pill shape (large border radius)', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container } = render(<Badge>X</Badge>);
    const span = container.firstElementChild as HTMLElement;
    expect(span.style.borderRadius).toBe('999px');
  });

  it('applies custom colors and font size', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container } = render(
      <Badge bg="red" textColor="white" fontSize={20}>X</Badge>,
    );
    const span = container.firstElementChild as HTMLElement;
    expect(span.style.color).toBe('white');
    expect(span.style.fontSize).toBe('20px');
  });

  it('merges custom style', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container } = render(<Badge style={{ margin: '10px' }}>X</Badge>);
    const span = container.firstElementChild as HTMLElement;
    expect(span.style.margin).toBe('10px');
  });
});
