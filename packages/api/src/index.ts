import 'dotenv/config';
import { createServer } from 'node:http';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getRequestListener } from '@hono/node-server';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { authRoutes } from './routes/auth.js';
import { apiKeysRoutes } from './routes/api-keys.js';
import { renderRoutes } from './routes/render.js';
import { usageRoutes } from './routes/usage.js';
import { mediaRoutes } from './routes/media.js';
import { billingRoutes } from './routes/billing.js';
import { adminRoutes } from './routes/admin.js';
import { db } from './db/index.js';
import { startBoss } from './lib/boss.js';
import { registerRenderWorker } from './workers/render.js';
import { handleMcpPost, handleMcpMethodNotAllowed } from './mcp/handler.js';

const app = new Hono();

app.use('*', cors());

// Health check
app.get('/health', (c) => c.json({ ok: true }));

// Mount routes
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/api-keys', apiKeysRoutes);
app.route('/api/v1/render', renderRoutes);
app.route('/api/v1/usage', usageRoutes);
app.route('/api/v1/media', mediaRoutes);
app.route('/api/v1/billing', billingRoutes);
app.route('/admin', adminRoutes);

const port = parseInt(process.env.PORT ?? '8000', 10);

async function main() {
  // Run database migrations
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('[drizzle] migrations applied');

  // Start pg-boss and register workers
  await startBoss();
  await registerRenderWorker();

  // Create Node HTTP server with MCP interception
  const honoListener = getRequestListener(app.fetch);

  const server = createServer(async (req, res) => {
    if (req.url === '/mcp' && req.method === 'POST') {
      await handleMcpPost(req, res);
    } else if (req.url === '/mcp') {
      handleMcpMethodNotAllowed(req, res);
    } else {
      honoListener(req, res);
    }
  });

  server.listen(port, () => {
    console.log(`[oanim-api] listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
