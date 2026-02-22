import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, renderJobs } from '../db/index.js';
import { uploadToS3, getPresignedDownloadUrl } from '../lib/s3.js';
import { getBoss } from '../lib/boss.js';
import { requireAuth, type AuthUser } from '../lib/auth.js';

const render = new Hono<{ Variables: { user: AuthUser } }>();

render.use('*', requireAuth);

/**
 * POST /api/v1/render/upload
 * Accept tarball blob, store in S3.
 */
render.post('/upload', async (c) => {
  const user = c.get('user');

  const blob = await c.req.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  const storageKey = `bundles/${user.id}/${crypto.randomUUID()}.tar.gz`;

  await uploadToS3(storageKey, buffer, 'application/gzip');

  return c.json({ storageKey });
});

/**
 * POST /api/v1/render
 * Submit a render job.
 */
render.post('/', async (c) => {
  const user = c.get('user');

  const body = await c.req.json<{
    config: Record<string, unknown>;
    storageKey: string;
  }>();

  if (!body.config || !body.storageKey) {
    return c.json({ error: 'Missing config or storageKey' }, 400);
  }

  const compositionId =
    (body.config.compositionId as string) ?? (body.config.name as string) ?? 'Main';

  const [job] = await db
    .insert(renderJobs)
    .values({
      userId: user.id,
      compositionId,
      config: body.config,
      bundleKey: body.storageKey,
    })
    .returning();

  // Enqueue render worker
  const boss = getBoss();
  const pgBossJobId = await boss.send('render', { jobId: job.id });
  console.log('[render] boss.send result:', pgBossJobId, 'for job:', job.id);

  const queueSize = await boss.getQueueSize('render');
  console.log('[render] queue size after send:', queueSize);

  return c.json({ job_id: job.id, pgboss_id: pgBossJobId });
});

/**
 * GET /api/v1/render/:jobId
 * Get render job status.
 */
render.get('/:jobId', async (c) => {
  const user = c.get('user');
  const jobId = c.req.param('jobId');

  const [job] = await db.select().from(renderJobs).where(eq(renderJobs.id, jobId)).limit(1);
  if (!job) return c.json({ error: 'Job not found' }, 404);
  if (job.userId !== user.id) return c.json({ error: 'Not authorized' }, 403);

  let outputUrl: string | undefined;
  if (job.status === 'done' && job.outputKey) {
    outputUrl = await getPresignedDownloadUrl(job.outputKey);
  }

  return c.json({
    status: job.status,
    progress: job.progress,
    output_url: outputUrl,
    error: job.error,
  });
});

/**
 * GET /api/v1/render/:jobId/download
 * Redirect to presigned S3 URL for the rendered MP4.
 */
render.get('/:jobId/download', async (c) => {
  const user = c.get('user');
  const jobId = c.req.param('jobId');

  const [job] = await db.select().from(renderJobs).where(eq(renderJobs.id, jobId)).limit(1);
  if (!job) return c.json({ error: 'Job not found' }, 404);
  if (job.userId !== user.id) return c.json({ error: 'Not authorized' }, 403);
  if (job.status !== 'done' || !job.outputKey) {
    return c.json({ error: 'Render not complete' }, 400);
  }

  const url = await getPresignedDownloadUrl(job.outputKey);
  return c.redirect(url);
});

export { render as renderRoutes };
