import { eq } from 'drizzle-orm';
import { db, renderJobs } from '../db/index.js';
import { downloadFromS3, uploadToS3 } from '../lib/s3.js';
import { getBoss } from '../lib/boss.js';

interface RenderPayload {
  jobId: string;
}

export async function registerRenderWorker(): Promise<void> {
  const boss = getBoss();

  boss.on('error', (err: Error) => console.error('[pg-boss] error event:', err));

  await boss.work<RenderPayload>('render', async ([job]) => {
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

        // Upload bundle to Remotion's S3 bucket
        const region = process.env.AWS_REGION ?? 'us-east-1';
        const { getOrCreateBucket } = await import('@remotion/lambda');
        const { getAwsClient } = await import('@remotion/lambda/client');
        const { lookup: mimeType } = await import('mime-types');

        const { bucketName } = await getOrCreateBucket({
          region: region as Parameters<typeof getOrCreateBucket>[0]['region'],
        });
        const { client: s3Client, sdk } = getAwsClient({
          region: region as Parameters<typeof getAwsClient>[0]['region'],
          service: 's3',
        });

        const siteName = `oanim-render-${jobId}`;
        const subFolder = `sites/${siteName}`;

        // Recursively collect all files in the extracted bundle
        async function getAllFiles(dir: string, base = ''): Promise<string[]> {
          const { readdir } = await import('node:fs/promises');
          const entries = await readdir(dir, { withFileTypes: true });
          const files: string[] = [];
          for (const entry of entries) {
            const rel = base ? `${base}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
              files.push(...(await getAllFiles(join(dir, entry.name), rel)));
            } else {
              files.push(rel);
            }
          }
          return files;
        }

        const { readFile, writeFile: writeFileFs } = await import('node:fs/promises');

        // Rewrite absolute paths in index.html to relative so they resolve on S3
        const indexPath = join(extractDir, 'index.html');
        let indexHtml = await readFile(indexPath, 'utf-8');
        indexHtml = indexHtml.replace(/src="\/([^"]+)"/g, 'src="./$1"');
        indexHtml = indexHtml.replace(/href="\/([^"]+)"/g, 'href="./$1"');
        await writeFileFs(indexPath, indexHtml, 'utf-8');

        const bundleFiles = await getAllFiles(extractDir);
        for (const file of bundleFiles) {
          const filePath = join(extractDir, file);
          const key = `${subFolder}/${file}`;
          const contentType = mimeType(filePath) || 'application/octet-stream';
          await s3Client.send(
            new sdk.PutObjectCommand({
              Bucket: bucketName,
              Key: key,
              Body: await readFile(filePath),
              ContentType: contentType,
            }),
          );
        }

        const serveUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${subFolder}/index.html`;

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

        const { renderId, bucketName: renderBucketName } = renderResult;

        // Poll for render progress
        let progress = 20;
        while (progress < 100) {
          await new Promise((r) => setTimeout(r, 3000));

          const renderProgress = await getRenderProgress({
            renderId,
            bucketName: renderBucketName,
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
