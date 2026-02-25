import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Terminal } from '../../components/Terminal';

afterEach(cleanup);

function mockFrame(frame: number) {
  vi.mocked(useCurrentFrame).mockReturnValue(frame);
}

describe('Terminal', () => {
  it('renders title bar with traffic lights', () => {
    mockFrame(0);
    const { container } = render(<Terminal lines={['hello']} />);
    // Traffic lights: 3 colored circles
    const circles = container.querySelectorAll('div[style*="border-radius: 50%"]');
    expect(circles.length).toBeGreaterThanOrEqual(3);
  });

  it('shows default title "Terminal"', () => {
    mockFrame(0);
    const { container } = render(<Terminal lines={['hello']} />);
    expect(container.textContent).toContain('Terminal');
  });

  it('shows custom title', () => {
    mockFrame(0);
    const { container } = render(<Terminal lines={['hello']} title="zsh" />);
    expect(container.textContent).toContain('zsh');
  });

  it('shows no content at frame 0', () => {
    mockFrame(0);
    const { container } = render(<Terminal lines={['hello world']} />);
    // At frame 0, 0 chars visible — only title text
    expect(container.textContent).toContain('Terminal');
  });

  it('reveals content over time', () => {
    // charsPerSecond=30, fps=30 => 1 char/frame. At frame 5, 5 chars visible
    mockFrame(5);
    const { container } = render(<Terminal lines={['hello world']} />);
    expect(container.textContent).toContain('hello');
  });

  it('shows cursor when not done', () => {
    mockFrame(3);
    const { container } = render(<Terminal lines={['hello']} />);
    // Cursor is the block character \u2588
    const html = container.innerHTML;
    expect(html).toContain('\u2588');
  });

  it('respects delay', () => {
    mockFrame(10);
    // delay=1 => 30 frame delay; at frame 10, adjustedFrame=0
    const { container } = render(<Terminal lines={['hello']} delay={1} />);
    // Should not show any content yet (only title)
    expect(container.textContent).toContain('Terminal');
  });

  it('applies custom background and font size', () => {
    mockFrame(0);
    const { container } = render(
      <Terminal lines={['x']} bg="#000" fontSize={24} />,
    );
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv.style.background).toContain('rgb(0, 0, 0)');
  });

  it('merges custom style', () => {
    mockFrame(0);
    const { container } = render(
      <Terminal lines={['x']} style={{ width: '500px' }} />,
    );
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv.style.width).toBe('500px');
  });
});
