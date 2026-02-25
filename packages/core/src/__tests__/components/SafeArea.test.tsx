import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { SafeArea } from '../../components/SafeArea';

afterEach(cleanup);

describe('SafeArea', () => {
  it('renders children inside AbsoluteFill', () => {
    const { container } = render(<SafeArea>Hello</SafeArea>);
    expect(container.textContent).toBe('Hello');
    expect(container.querySelector('[data-testid="absolute-fill"]')).toBeTruthy();
  });

  it('defaults to title mode (10% padding)', () => {
    const { container } = render(<SafeArea>X</SafeArea>);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    expect(fill.style.padding).toBe('10%');
  });

  it('uses 5% padding in action mode', () => {
    const { container } = render(<SafeArea mode="action">X</SafeArea>);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    expect(fill.style.padding).toBe('5%');
  });

  it('applies flex column layout', () => {
    const { container } = render(<SafeArea>X</SafeArea>);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    expect(fill.style.display).toBe('flex');
    expect(fill.style.flexDirection).toBe('column');
  });

  it('merges custom style', () => {
    const { container } = render(<SafeArea style={{ gap: '10px' }}>X</SafeArea>);
    const fill = container.querySelector('[data-testid="absolute-fill"]') as HTMLElement;
    expect(fill.style.gap).toBe('10px');
  });
});
