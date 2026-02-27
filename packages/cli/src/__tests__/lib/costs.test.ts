import { describe, it, expect } from 'vitest';
import {
  PLATFORM_MARGIN,
  FAL_MODEL_COSTS,
  DEFAULT_COST,
  getModelCost,
} from '../../lib/costs';

describe('PLATFORM_MARGIN', () => {
  it('is 40%', () => {
    expect(PLATFORM_MARGIN).toBe(0.4);
  });
});

describe('FAL_MODEL_COSTS', () => {
  it('has entries for major image models', () => {
    expect(FAL_MODEL_COSTS['fal-ai/flux/schnell']).toBe(0.003);
    expect(FAL_MODEL_COSTS['fal-ai/flux-2-flex']).toBe(0.05);
    expect(FAL_MODEL_COSTS['fal-ai/recraft/v4/text-to-image']).toBe(0.04);
  });

  it('has entries for video models', () => {
    expect(FAL_MODEL_COSTS['fal-ai/kling-video/v2.5-turbo/pro/text-to-video']).toBe(0.35);
  });

  it('has entries for background removal', () => {
    expect(FAL_MODEL_COSTS['fal-ai/birefnet']).toBe(0.005);
  });

  it('all values are non-negative numbers', () => {
    for (const [model, cost] of Object.entries(FAL_MODEL_COSTS)) {
      expect(cost).toBeGreaterThanOrEqual(0);
      expect(typeof cost).toBe('number');
    }
  });
});

describe('DEFAULT_COST', () => {
  it('is $0.05', () => {
    expect(DEFAULT_COST).toBe(0.05);
  });
});

describe('getModelCost', () => {
  it('applies platform margin to known model', () => {
    const cost = getModelCost('fal-ai/flux/schnell');
    expect(cost).toBeCloseTo(0.003 * 1.4, 6);
  });

  it('uses default cost for unknown model', () => {
    const cost = getModelCost('some-unknown/model');
    expect(cost).toBeCloseTo(DEFAULT_COST * (1 + PLATFORM_MARGIN), 6);
  });

  it('applies margin to audio models', () => {
    const cost = getModelCost('beatoven/music-generation');
    expect(cost).toBeCloseTo(0.05 * 1.4, 6);
  });
});
