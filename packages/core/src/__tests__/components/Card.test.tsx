import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { useCurrentFrame } from 'remotion';
import { Card } from '../../components/Card';

afterEach(cleanup);

describe('Card', () => {
  it('renders children', () => {
    const { container } = render(<Card>Hello</Card>);
    expect(container.textContent).toBe('Hello');
  });

  it('starts invisible at frame 0', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container } = render(<Card>X</Card>);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.opacity).toBe('0');
  });

  it('becomes visible at high frame', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(120);
    const { container } = render(<Card>X</Card>);
    const div = container.firstElementChild as HTMLElement;
    expect(parseFloat(div.style.opacity)).toBeGreaterThan(0.9);
  });

  it('has glassmorphism backdrop blur', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container } = render(<Card>X</Card>);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.backdropFilter).toContain('blur(20px)');
  });

  it('applies custom padding and border radius', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container } = render(<Card padding={16} borderRadius={8}>X</Card>);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.padding).toBe('16px');
    expect(div.style.borderRadius).toBe('8px');
  });

  it('merges custom style', () => {
    vi.mocked(useCurrentFrame).mockReturnValue(0);
    const { container } = render(<Card style={{ maxWidth: '400px' }}>X</Card>);
    const div = container.firstElementChild as HTMLElement;
    expect(div.style.maxWidth).toBe('400px');
  });
});
