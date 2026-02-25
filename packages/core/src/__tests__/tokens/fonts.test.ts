import { describe, it, expect } from 'vitest';
import { fonts } from '../../tokens/fonts';

describe('fonts', () => {
  it('exports heading, body, and mono categories', () => {
    expect(Object.keys(fonts)).toEqual(['heading', 'body', 'mono']);
  });

  it('heading fonts include Inter and Instrument Serif', () => {
    expect(fonts.heading.inter).toContain('Inter');
    expect(fonts.heading.instrumentSerif).toContain('Instrument Serif');
  });

  it('mono fonts include JetBrains Mono', () => {
    expect(fonts.mono.jetbrainsMono).toContain('JetBrains Mono');
  });

  it('all values are non-empty strings', () => {
    for (const category of Object.values(fonts)) {
      for (const value of Object.values(category)) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });
});
