import { Command } from 'commander';
import ora from 'ora';
import { generateImage, editImage, removeBackground, upscaleImage } from '../lib/fal';
import { log } from '../lib/output';

export const assetsCommand = new Command('assets')
  .description('AI-powered asset generation via fal.ai');

assetsCommand
  .command('gen-image')
  .description('Generate an image from a text prompt')
  .requiredOption('--prompt <text>', 'image generation prompt')
  .requiredOption('--out <path>', 'output file path')
  .action(async (opts) => {
    const spinner = ora('Generating image...').start();
    try {
      await generateImage(opts.prompt, opts.out);
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
  .action(async (opts) => {
    const spinner = ora('Editing image...').start();
    try {
      await editImage(opts.in, opts.prompt, opts.out);
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
  .action(async (opts) => {
    const spinner = ora('Removing background...').start();
    try {
      await removeBackground(opts.in, opts.out);
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
  .action(async (opts) => {
    const spinner = ora('Upscaling image...').start();
    try {
      await upscaleImage(opts.in, opts.out);
      spinner.succeed(`Upscaled image saved to ${opts.out}`);
    } catch (err) {
      spinner.fail('Upscaling failed');
      log.error(String(err));
      process.exit(1);
    }
  });
