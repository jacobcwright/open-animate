import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { authRoutes } from './routes/auth.js';
import { apiKeysRoutes } from './routes/api-keys.js';
import { renderRoutes } from './routes/render.js';
import { usageRoutes } from './routes/usage.js';
import { db } from './db/index.js';
import { startBoss } from './lib/boss.js';
import { registerRenderWorker } from './workers/render.js';

const app = new Hono();

app.use('*', cors());

// Health check
app.get('/health', (c) => c.json({ ok: true }));

// Diagnostic: query pg-boss queue state + test send
app.get('/debug/queue', async (c) => {
  try {
    const boss = (await import('./lib/boss.js')).getBoss();
    const sizeBefore = await boss.getQueueSize('render');

    // Send a test job
    const testId = await boss.send('render-test', { test: true });

    const sizeAfter = await boss.getQueueSize('render');
    const testSize = await boss.getQueueSize('render-test');

    return c.json({
      render_queue: sizeBefore,
      render_queue_after_test: sizeAfter,
      test_queue: testSize,
      test_job_id: testId,
      boss_started: !!(boss as Record<string, unknown>).started,
    });
  } catch (err: unknown) {
    return c.json({ error: String(err), stack: (err as Error).stack });
  }
});

// Mount routes
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/api-keys', apiKeysRoutes);
app.route('/api/v1/render', renderRoutes);
app.route('/api/v1/usage', usageRoutes);

const port = parseInt(process.env.PORT ?? '8000', 10);

async function main() {
  // Run database migrations
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('[drizzle] migrations applied');

  // Start pg-boss and register workers
  await startBoss();
  await registerRenderWorker();

  serve({ fetch: app.fetch, port }, () => {
    console.log(`[oanim-api] listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
