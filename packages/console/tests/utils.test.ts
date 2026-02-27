import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});

describe('formatCurrency', () => {
  it('formats positive amounts', () => {
    expect(formatCurrency(5)).toBe('$5.00');
  });

  it('formats small amounts', () => {
    expect(formatCurrency(0.0042)).toBe('$0.00');
  });

  it('formats large amounts', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    // Use ISO format with time to avoid timezone-dependent day shifts
    const result = formatDate('2026-02-15T12:00:00');
    expect(result).toContain('Feb');
    expect(result).toContain('2026');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date(2026, 0, 1));
    expect(result).toContain('Jan');
    expect(result).toContain('1');
    expect(result).toContain('2026');
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for recent times', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('returns minutes for recent past', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours for same-day past', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('returns days for recent past', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
  });
});
