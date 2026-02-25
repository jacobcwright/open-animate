import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Grid } from '../../components/Grid';

afterEach(cleanup);

describe('Grid', () => {
  it('renders a div with grid background', () => {
    const { container } = render(<Grid />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.backgroundImage).toContain('linear-gradient');
  });

  it('uses default cell size of 60px', () => {
    const { container } = render(<Grid />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.backgroundSize).toContain('60px');
  });

  it('applies custom cell size', () => {
    const { container } = render(<Grid cellSize={100} />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.backgroundSize).toContain('100px');
  });

  it('animates by default', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(30);
    const { container } = render(<Grid />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.transform).toContain('translate(');
  });

  it('does not animate when animated=false', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(30);
    const { container } = render(<Grid animated={false} />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.transform).toContain('translate(0px');
  });

  it('has pointer-events none', () => {
    const { container } = render(<Grid />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.pointerEvents).toBe('none');
  });
});
