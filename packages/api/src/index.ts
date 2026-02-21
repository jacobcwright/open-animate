import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { authRoutes } from './routes/auth.js';
import { apiKeysRoutes } from './routes/api-keys.js';
import { renderRoutes } from './routes/render.js';
import { startBoss } from './lib/boss.js';
import { registerRenderWorker } from './workers/render.js';

const app = new Hono();

app.use('*', cors());

// Health check
app.get('/health', (c) => c.json({ ok: true }));

// Mount routes
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/api-keys', apiKeysRoutes);
app.route('/api/v1/render', renderRoutes);

const port = parseInt(process.env.PORT ?? '8000', 10);

async function main() {
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
