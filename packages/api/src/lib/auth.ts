import { createMiddleware } from 'hono/factory';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { eq } from 'drizzle-orm';
import { db, users, apiKeys } from '../db/index.js';
import { hashApiKey } from './security.js';

export type AuthUser = {
  id: string;
  clerkId: string;
  email: string;
  creditBalanceUsd: string;
  createdAt: Date;
};

/**
 * Authenticate a request by Authorization header.
 * Supports: Bearer <anim_xxx> (API key) or Bearer <clerk_jwt>.
 */
export async function authenticateRequest(authHeader: string | null): Promise<AuthUser | null> {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  const token = parts[1];

  // API key auth — starts with anim_
  if (token.startsWith('anim_')) {
    return authenticateApiKey(token);
  }

  // Clerk JWT auth
  return authenticateClerkJwt(token);
}

async function authenticateApiKey(key: string): Promise<AuthUser | null> {
  // Extract prefix (anim_XXXXXXXX) to narrow the search
  const underscoreIdx = key.indexOf('_', 5); // after "anim_"
  if (underscoreIdx === -1) return null;
  const prefix = key.slice(0, underscoreIdx);

  const [keyRow] = await db.select().from(apiKeys).where(eq(apiKeys.prefix, prefix)).limit(1);
  if (!keyRow) return null;

  const hash = await hashApiKey(key);
  if (hash !== keyRow.keyHash) return null;

  // Update lastUsedAt
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyRow.id));

  const [user] = await db.select().from(users).where(eq(users.id, keyRow.userId)).limit(1);
  if (!user) return null;

  return user;
}

async function authenticateClerkJwt(token: string): Promise<AuthUser | null> {
  const clerkDomain = process.env.CLERK_DOMAIN;
  if (!clerkDomain) return null;

  try {
    const JWKS = createRemoteJWKSet(new URL(`https://${clerkDomain}/.well-known/jwks.json`));
    const { payload } = await jwtVerify(token, JWKS);

    const clerkId = payload.sub;
    if (!clerkId) return null;

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    return user ?? null;
  } catch {
    return null;
  }
}

/**
 * Hono middleware that requires authentication.
 * Sets `c.get('user')` on success, returns 401 on failure.
 */
export const requireAuth = createMiddleware<{ Variables: { user: AuthUser } }>(async (c, next) => {
  const authHeader = c.req.header('Authorization') ?? null;
  const user = await authenticateRequest(authHeader);

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  c.set('user', user);
  await next();
});
