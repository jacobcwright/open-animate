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
    expect(FAL_MODEL_COSTS['fal-ai/flux/dev']).toBe(0.025);
    expect(FAL_MODEL_COSTS['fal-ai/flux-pro/v1.1']).toBe(0.04);
  });

  it('has entries for video models', () => {
    expect(FAL_MODEL_COSTS['fal-ai/kling-video/v1/standard/text-to-video']).toBe(0.225);
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

  it('returns 0 for free models (stable-audio)', () => {
    const cost = getModelCost('fal-ai/stable-audio');
    expect(cost).toBe(0);
  });
});
