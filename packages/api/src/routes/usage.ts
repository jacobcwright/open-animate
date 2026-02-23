import { Hono } from 'hono';
import { eq, sql, desc } from 'drizzle-orm';
import { db, usageRecords, users } from '../db/index.js';
import { requireAuth, type AuthUser } from '../lib/auth.js';

const usage = new Hono<{ Variables: { user: AuthUser } }>();

usage.use('*', requireAuth);

/**
 * POST /api/v1/usage
 * Bulk-insert usage records and deduct from credit balance.
 */
usage.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    records: { provider: string; model: string; operation: string; estimatedCostUsd: number }[];
  }>();

  if (!Array.isArray(body.records) || body.records.length === 0) {
    return c.json({ error: 'records array is required' }, 400);
  }

  const totalCost = body.records.reduce((sum, r) => sum + r.estimatedCostUsd, 0);

  const rows = body.records.map((r) => ({
    userId: user.id,
    provider: r.provider,
    model: r.model,
    operation: r.operation,
    estimatedCostUsd: String(r.estimatedCostUsd),
  }));

  await db.insert(usageRecords).values(rows);

  // Deduct from credit balance
  await db
    .update(users)
    .set({
      creditBalanceUsd: sql`GREATEST(${users.creditBalanceUsd}::numeric - ${totalCost}, 0)`,
    })
    .where(eq(users.id, user.id));

  return c.json({ inserted: rows.length }, 201);
});

/**
 * GET /api/v1/usage
 * Returns daily-aggregated usage for the authenticated user.
 * Query param: ?days=30 (default 30)
 */
usage.get('/', async (c) => {
  const user = c.get('user');
  const days = parseInt(c.req.query('days') ?? '30', 10);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      date: sql<string>`DATE(${usageRecords.createdAt})`.as('date'),
      totalCostUsd: sql<string>`SUM(${usageRecords.estimatedCostUsd})`.as('total_cost_usd'),
      count: sql<number>`COUNT(*)::int`.as('count'),
    })
    .from(usageRecords)
    .where(sql`${usageRecords.userId} = ${user.id} AND ${usageRecords.createdAt} >= ${since}`)
    .groupBy(sql`DATE(${usageRecords.createdAt})`)
    .orderBy(sql`DATE(${usageRecords.createdAt})`);

  const totalCostUsd = rows.reduce((sum, r) => sum + parseFloat(r.totalCostUsd), 0);

  return c.json({
    usage: rows.map((r) => ({
      date: r.date,
      totalCostUsd: parseFloat(r.totalCostUsd),
      count: r.count,
    })),
    totalCostUsd,
  });
});

/**
 * GET /api/v1/usage/records?limit=50&offset=0&days=30
 * Returns per-record usage detail for the authenticated user.
 */
usage.get('/records', async (c) => {
  const user = c.get('user');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);
  const days = parseInt(c.req.query('days') ?? '30', 10);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await db
    .select({
      id: usageRecords.id,
      provider: usageRecords.provider,
      model: usageRecords.model,
      operation: usageRecords.operation,
      estimatedCostUsd: usageRecords.estimatedCostUsd,
      createdAt: usageRecords.createdAt,
    })
    .from(usageRecords)
    .where(sql`${usageRecords.userId} = ${user.id} AND ${usageRecords.createdAt} >= ${since}`)
    .orderBy(desc(usageRecords.createdAt))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ total: sql<number>`COUNT(*)::int` })
    .from(usageRecords)
    .where(sql`${usageRecords.userId} = ${user.id} AND ${usageRecords.createdAt} >= ${since}`);

  return c.json({
    records: records.map((r) => ({
      id: r.id,
      provider: r.provider,
      model: r.model,
      operation: r.operation,
      estimatedCostUsd: parseFloat(r.estimatedCostUsd),
      createdAt: r.createdAt.toISOString(),
    })),
    total: countRow?.total ?? 0,
  });
});

/**
 * GET /api/v1/usage/balance
 * Returns the remaining credit balance for the authenticated user.
 */
usage.get('/balance', async (c) => {
  const user = c.get('user');

  // Re-fetch to get latest balance
  const [row] = await db
    .select({ creditBalanceUsd: users.creditBalanceUsd })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const balance = row ? parseFloat(row.creditBalanceUsd) : 0;

  return c.json({ creditBalanceUsd: balance });
});

export { usage as usageRoutes };
