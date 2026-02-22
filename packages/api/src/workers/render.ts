import { eq } from 'drizzle-orm';
import { db, renderJobs } from '../db/index.js';
import { downloadFromS3, uploadDirToS3, uploadToS3 } from '../lib/s3.js';
import { getBoss } from '../lib/boss.js';

interface RenderPayload {
  jobId: string;
}

export async function registerRenderWorker(): Promise<void> {
  const boss = getBoss();

  boss.on('error', (err: Error) => console.error('[pg-boss] error event:', err));

  await boss.work<RenderPayload>('render', { teamSize: 2 }, async (job) => {
    console.log('[worker] picked up job:', JSON.stringify(job.data));
    const { jobId } = job.data;

    // Mark as rendering
    await db
      .update(renderJobs)
      .set({ status: 'rendering', progress: 0, updatedAt: new Date() })
      .where(eq(renderJobs.id, jobId));

    try {
      // Get job details
      const [renderJob] = await db
        .select()
        .from(renderJobs)
        .where(eq(renderJobs.id, jobId))
        .limit(1);

      if (!renderJob || !renderJob.bundleKey) {
        throw new Error('Job or bundle not found');
      }

      // Download tarball from S3
      const tarballBuffer = await downloadFromS3(renderJob.bundleKey);

      // Extract tarball to temp directory
      const { mkdtemp, writeFile, mkdir, rm } = await import('node:fs/promises');
      const { join } = await import('node:path');
      const { tmpdir } = await import('node:os');
      const { execSync } = await import('node:child_process');

      const tempDir = await mkdtemp(join(tmpdir(), 'oanim-render-'));
      const tarballPath = join(tempDir, 'bundle.tar.gz');
      const extractDir = join(tempDir, 'bundle');

      try {
        await writeFile(tarballPath, tarballBuffer);
        await mkdir(extractDir, { recursive: true });
        execSync(`tar -xzf ${tarballPath} -C ${extractDir}`, { timeout: 30000 });

        // Upload bundle to S3 for Remotion Lambda
        const region = process.env.AWS_REGION ?? 'us-east-1';
        const bucket = process.env.S3_BUCKET ?? 'oanim-renders';
        const siteId = `oanim-render-${jobId}`;

        await uploadDirToS3(extractDir, `sites/${siteId}`);
        const serveUrl = `https://${bucket}.s3.${region}.amazonaws.com/sites/${siteId}`;

        // Update progress
        await db
          .update(renderJobs)
          .set({ progress: 20, updatedAt: new Date() })
          .where(eq(renderJobs.id, jobId));

        // Trigger Remotion Lambda render
        const { renderMediaOnLambda, getRenderProgress } = await import(
          '@remotion/lambda/client'
        );

        const compositionId = renderJob.compositionId;
        const config = (renderJob.config ?? {}) as Record<string, unknown>;
        const renderConfig = (config.render ?? {}) as Record<string, unknown>;

        const renderResult = await renderMediaOnLambda({
          region: region as Parameters<typeof renderMediaOnLambda>[0]['region'],
          functionName: process.env.REMOTION_FUNCTION_NAME!,
          serveUrl,
          composition: compositionId,
          codec: (renderConfig.codec as 'h264') ?? 'h264',
          inputProps: (config.props ?? {}) as Record<string, unknown>,
          framesPerLambda: 20,
        });

        const { renderId, bucketName } = renderResult;

        // Poll for render progress
        let progress = 20;
        while (progress < 100) {
          await new Promise((r) => setTimeout(r, 3000));

          const renderProgress = await getRenderProgress({
            renderId,
            bucketName,
            functionName: process.env.REMOTION_FUNCTION_NAME!,
            region: region as Parameters<typeof getRenderProgress>[0]['region'],
          });

          if (renderProgress.fatalErrorEncountered) {
            throw new Error(
              `Remotion render error: ${renderProgress.errors?.[0]?.message ?? 'Unknown error'}`,
            );
          }

          if (renderProgress.done) {
            const outputUrl = renderProgress.outputFile;
            if (!outputUrl) throw new Error('Render completed but no output URL');

            // Download rendered MP4 and store in our S3
            const mp4Response = await fetch(outputUrl);
            if (!mp4Response.ok) throw new Error('Failed to download rendered MP4');

            const mp4Buffer = Buffer.from(await mp4Response.arrayBuffer());
            const outputKey = `outputs/${renderJob.userId}/${jobId}.mp4`;
            await uploadToS3(outputKey, mp4Buffer, 'video/mp4');

            await db
              .update(renderJobs)
              .set({
                status: 'done',
                progress: 100,
                outputKey,
                updatedAt: new Date(),
              })
              .where(eq(renderJobs.id, jobId));

            return;
          }

          // Update progress (20 to 95 range mapped from Remotion's 0-1)
          progress = 20 + Math.floor((renderProgress.overallProgress ?? 0) * 75);
          await db
            .update(renderJobs)
            .set({ progress: Math.min(progress, 95), updatedAt: new Date() })
            .where(eq(renderJobs.id, jobId));
        }
      } finally {
        await rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown render error';
      console.error('Render worker error:', err);
      await db
        .update(renderJobs)
        .set({ status: 'error', error: message, updatedAt: new Date() })
        .where(eq(renderJobs.id, jobId));
    }
  });

  console.log('[worker] render worker registered');
}
