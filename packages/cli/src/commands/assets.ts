import { writeFile } from 'node:fs/promises';
import { Command } from 'commander';
import ora from 'ora';
import { MediaGateway } from '../lib/gateway';
import { getAuth } from '../lib/config';
import { log } from '../lib/output';

async function requireAuth(): Promise<void> {
  if (process.env.ANIMATE_FAL_KEY) return; // direct provider key — skip auth check
  const auth = await getAuth();
  if (!auth) {
    throw new Error(
      'Not authenticated. Run "oanim login" to sign in, or set ANIMATE_API_KEY.',
    );
  }
}

export const assetsCommand = new Command('assets')
  .description('AI-powered asset generation');

assetsCommand
  .command('gen-image')
  .description('Generate an image from a text prompt')
  .requiredOption('--prompt <text>', 'image generation prompt')
  .requiredOption('--out <path>', 'output file path')
  .option('--model <id>', 'override model (default: fal-ai/flux/schnell)')
  .action(async (opts) => {
    const spinner = ora('Generating image...').start();
    try {
      await requireAuth();
      const gw = new MediaGateway();
      await gw.generateImage(opts.prompt, opts.out, { model: opts.model });
      spinner.succeed(`Image saved to ${opts.out}`);
    } catch (err) {
      spinner.fail('Image generation failed');
      log.error(String(err));
      process.exit(1);
    }
  });

assetsCommand
  .command('edit-image')
  .description('Edit an image with a text prompt')
  .requiredOption('--in <path>', 'input image path')
  .requiredOption('--prompt <text>', 'edit prompt')
  .requiredOption('--out <path>', 'output file path')
  .option('--model <id>', 'override model (default: fal-ai/flux/dev/image-to-image)')
  .action(async (opts) => {
    const spinner = ora('Editing image...').start();
    try {
      await requireAuth();
      const gw = new MediaGateway();
      await gw.editImage(opts.in, opts.prompt, opts.out, opts.model);
      spinner.succeed(`Edited image saved to ${opts.out}`);
    } catch (err) {
      spinner.fail('Image editing failed');
      log.error(String(err));
      process.exit(1);
    }
  });

assetsCommand
  .command('remove-bg')
  .description('Remove background from an image')
  .requiredOption('--in <path>', 'input image path')
  .requiredOption('--out <path>', 'output file path')
  .option('--model <id>', 'override model (default: fal-ai/birefnet)')
  .action(async (opts) => {
    const spinner = ora('Removing background...').start();
    try {
      await requireAuth();
      const gw = new MediaGateway();
      await gw.removeBackground(opts.in, opts.out, opts.model);
      spinner.succeed(`Image saved to ${opts.out}`);
    } catch (err) {
      spinner.fail('Background removal failed');
      log.error(String(err));
      process.exit(1);
    }
  });

assetsCommand
  .command('upscale')
  .description('Upscale an image 2x')
  .requiredOption('--in <path>', 'input image path')
  .requiredOption('--out <path>', 'output file path')
  .option('--model <id>', 'override model (default: fal-ai/creative-upscaler)')
  .action(async (opts) => {
    const spinner = ora('Upscaling image...').start();
    try {
      await requireAuth();
      const gw = new MediaGateway();
      await gw.upscaleImage(opts.in, opts.out, opts.model);
      spinner.succeed(`Upscaled image saved to ${opts.out}`);
    } catch (err) {
      spinner.fail('Upscaling failed');
      log.error(String(err));
      process.exit(1);
    }
  });

assetsCommand
  .command('run')
  .description('Run any fal.ai model')
  .requiredOption('--model <id>', 'fal.ai model ID (e.g. fal-ai/flux/schnell)')
  .requiredOption('--input <json>', 'JSON input for the model')
  .option('--out <path>', 'download result URL to file')
  .action(async (opts) => {
    const spinner = ora(`Running ${opts.model}...`).start();
    try {
      await requireAuth();

      let input: Record<string, unknown>;
      try {
        input = JSON.parse(opts.input) as Record<string, unknown>;
      } catch {
        throw new Error('Invalid --input: must be valid JSON');
      }

      const gw = new MediaGateway();
      const result = await gw.run(opts.model, input);
      spinner.stop();

      if (opts.out && result.url) {
        const dlSpinner = ora('Downloading...').start();
        const res = await fetch(result.url);
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        await writeFile(opts.out, buffer);
        dlSpinner.succeed(`Saved to ${opts.out} ($${result.estimatedCostUsd.toFixed(4)})`);
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (err) {
      spinner.fail(`${opts.model} failed`);
      log.error(String(err));
      process.exit(1);
    }
  });
