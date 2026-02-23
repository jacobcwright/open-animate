import type { Context, Next } from 'hono';

interface RateLimitOpts {
  windowMs: number;
  maxRequests: number;
  keyFn: (c: Context) => string;
}

interface WindowEntry {
  timestamps: number[];
}

export function rateLimit({ windowMs, maxRequests, keyFn }: RateLimitOpts) {
  const windows = new Map<string, WindowEntry>();

  // Clean stale entries every 60s
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of windows) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) windows.delete(key);
    }
  }, 60_000);
  cleanup.unref();

  return async (c: Context, next: Next) => {
    const key = keyFn(c);
    const now = Date.now();

    let entry = windows.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      windows.set(key, entry);
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= maxRequests) {
      const oldest = entry.timestamps[0];
      const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
      c.header('Retry-After', String(retryAfter));
      return c.json({ error: 'Too many requests. Please try again later.' }, 429);
    }

    entry.timestamps.push(now);
    await next();
  };
}

/** 60 requests per minute, keyed by authenticated user ID */
export const mediaRateLimit = rateLimit({
  windowMs: 60_000,
  maxRequests: 60,
  keyFn: (c) => c.get('user')?.id ?? 'anonymous',
});

/** 10 requests per minute, keyed by client IP */
export const authRateLimit = rateLimit({
  windowMs: 60_000,
  maxRequests: 10,
  keyFn: (c) => c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown',
});
