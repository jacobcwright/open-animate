import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedCharacters, TypewriterText, CountUp } from '../../animations/typography';

afterEach(cleanup);

function mockFrame(frame: number) {
  vi.mocked(useCurrentFrame).mockReturnValue(frame);
}

function mockFps(fps: number) {
  vi.mocked(useVideoConfig).mockReturnValue({
    fps,
    width: 1920,
    height: 1080,
    durationInFrames: 150,
    id: 'test',
    defaultProps: {},
    props: {},
    defaultCodec: 'h264' as any,
  });
}

describe('AnimatedCharacters', () => {
  it('renders all characters', () => {
    mockFrame(120);
    const { container } = render(<AnimatedCharacters text="Hello" />);
    expect(container.textContent).toBe('Hello');
  });

  it('has inline-flex display on wrapper', () => {
    mockFrame(0);
    const { container } = render(<AnimatedCharacters text="AB" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.display).toBe('inline-flex');
  });

  it('each character is an inline-block span', () => {
    mockFrame(0);
    const { container } = render(<AnimatedCharacters text="Hi" />);
    const chars = container.querySelectorAll('span > span');
    expect(chars).toHaveLength(2);
    expect((chars[0] as HTMLElement).style.display).toBe('inline-block');
  });

  it('characters start invisible at frame 0', () => {
    mockFrame(0);
    const { container } = render(<AnimatedCharacters text="A" />);
    const char = container.querySelector('span > span') as HTMLElement;
    expect(char.style.opacity).toBe('0');
  });

  it('characters become visible at high frame count', () => {
    mockFrame(120);
    const { container } = render(<AnimatedCharacters text="A" />);
    const char = container.querySelector('span > span') as HTMLElement;
    expect(parseFloat(char.style.opacity)).toBeGreaterThan(0.9);
  });

  it('spaces use white-space: pre', () => {
    mockFrame(0);
    const { container } = render(<AnimatedCharacters text="A B" />);
    const chars = container.querySelectorAll('span > span');
    expect((chars[1] as HTMLElement).style.whiteSpace).toBe('pre');
  });

  it('applies custom style to wrapper', () => {
    mockFrame(0);
    const { container } = render(
      <AnimatedCharacters text="X" style={{ color: 'red' }} />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.color).toBe('red');
  });

  it('respects delay prop', () => {
    mockFrame(5);
    mockFps(30);
    // delay=1 means 30 frames delay; at frame 5, adjusted is 0
    const { container } = render(<AnimatedCharacters text="A" delay={1} />);
    const char = container.querySelector('span > span') as HTMLElement;
    expect(char.style.opacity).toBe('0');
  });
});

describe('TypewriterText', () => {
  it('shows no characters at frame 0', () => {
    mockFrame(0);
    mockFps(30);
    const { container } = render(<TypewriterText text="Hello World" />);
    // Only cursor should be visible (no text content except cursor)
    expect(container.textContent).toBe('|');
  });

  it('reveals characters over time', () => {
    // charsPerSecond=20, fps=30 => framesPerChar=1.5
    // At frame 15, 10 chars visible
    mockFrame(15);
    mockFps(30);
    const { container } = render(<TypewriterText text="Hello World" />);
    expect(container.textContent).toContain('Hello Worl');
  });

  it('shows cursor when not done', () => {
    mockFrame(0);
    mockFps(30);
    const { container } = render(<TypewriterText text="Hi" showCursor={true} />);
    expect(container.textContent).toContain('|');
  });

  it('hides cursor when showCursor=false', () => {
    mockFrame(0);
    mockFps(30);
    const { container } = render(<TypewriterText text="Hi" showCursor={false} />);
    expect(container.textContent).toBe('');
  });

  it('supports custom cursor char', () => {
    mockFrame(0);
    mockFps(30);
    const { container } = render(<TypewriterText text="Hi" cursorChar="_" />);
    expect(container.textContent).toContain('_');
  });

  it('respects delay', () => {
    mockFrame(10);
    mockFps(30);
    // delay=1 => 30 frame delay. At frame 10, adjustedFrame=0, 0 chars visible
    const { container } = render(<TypewriterText text="Hello" delay={1} />);
    expect(container.textContent).toBe('|');
  });

  it('applies style prop', () => {
    mockFrame(0);
    const { container } = render(
      <TypewriterText text="X" style={{ color: 'blue' }} />,
    );
    const span = container.firstElementChild as HTMLElement;
    expect(span.style.color).toBe('blue');
  });
});

describe('CountUp', () => {
  it('shows start value at frame 0', () => {
    mockFrame(0);
    mockFps(30);
    const { container } = render(<CountUp from={0} to={100} />);
    expect(container.textContent).toBe('0');
  });

  it('reaches end value after duration', () => {
    // duration=1 at fps=30 => 30 frames
    mockFrame(60);
    mockFps(30);
    const { container } = render(<CountUp from={0} to={100} />);
    expect(container.textContent).toBe('100');
  });

  it('supports prefix and suffix', () => {
    mockFrame(60);
    mockFps(30);
    const { container } = render(
      <CountUp from={0} to={50} prefix="$" suffix="k" />,
    );
    expect(container.textContent).toBe('$50k');
  });

  it('supports decimals', () => {
    mockFrame(60);
    mockFps(30);
    const { container } = render(<CountUp from={0} to={3.14} decimals={2} />);
    expect(container.textContent).toBe('3.14');
  });

  it('respects delay', () => {
    mockFrame(5);
    mockFps(30);
    // delay=1 => 30 frame delay; at frame 5, still at start
    const { container } = render(<CountUp from={10} to={100} delay={1} />);
    expect(container.textContent).toBe('10');
  });

  it('applies style prop', () => {
    mockFrame(0);
    const { container } = render(
      <CountUp from={0} to={100} style={{ fontWeight: 'bold' }} />,
    );
    const span = container.firstElementChild as HTMLElement;
    expect(span.style.fontWeight).toBe('bold');
  });
});
