import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db, apiKeys } from '../db/index.js';
import { generateApiKey } from '../lib/security.js';
import { requireAuth, type AuthUser } from '../lib/auth.js';

const MAX_KEYS_PER_USER = 10;

const keys = new Hono<{ Variables: { user: AuthUser } }>();

keys.use('*', requireAuth);

/**
 * GET /api/v1/api-keys
 * List all API keys for the authenticated user.
 */
keys.get('/', async (c) => {
  const user = c.get('user');

  const rows = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.id));

  return c.json({
    api_keys: rows.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      created_at: k.createdAt.getTime(),
      last_used_at: k.lastUsedAt?.getTime(),
    })),
  });
});

/**
 * POST /api/v1/api-keys
 * Create a new API key.
 */
keys.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{ name?: string }>();
  const name = body.name ?? 'Unnamed key';

  // Check key limit
  const existing = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.id));

  if (existing.length >= MAX_KEYS_PER_USER) {
    return c.json({ error: `Maximum of ${MAX_KEYS_PER_USER} API keys per user` }, 400);
  }

  const { fullKey, prefix, keyHash } = await generateApiKey();

  const [row] = await db
    .insert(apiKeys)
    .values({ userId: user.id, name, prefix, keyHash })
    .returning();

  return c.json(
    {
      api_key: {
        id: row.id,
        name: row.name,
        prefix: row.prefix,
        created_at: row.createdAt.getTime(),
      },
      key: fullKey,
    },
    201,
  );
});

/**
 * DELETE /api/v1/api-keys/:keyId
 * Revoke an API key.
 */
keys.delete('/:keyId', async (c) => {
  const user = c.get('user');
  const keyId = c.req.param('keyId');

  const [key] = await db.select().from(apiKeys).where(eq(apiKeys.id, keyId)).limit(1);
  if (!key) return c.json({ error: 'API key not found' }, 404);
  if (key.userId !== user.id) return c.json({ error: 'Not authorized' }, 403);

  await db.delete(apiKeys).where(eq(apiKeys.id, keyId));
  return c.body(null, 204);
});

export { keys as apiKeysRoutes };
