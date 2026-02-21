import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import ora from 'ora';
import { loadScene } from '../lib/scene';
import { log, keyValue } from '../lib/output';

export const renderCommand = new Command('render')
  .description('Render a composition to video using animate.json config')
  .option('--out <path>', 'output file path')
  .option('--fps <n>', 'frames per second', parseInt)
  .option('--res <WxH>', 'resolution (e.g. 1920x1080)')
  .option('--codec <codec>', 'video codec (h264, h265, vp8, vp9)')
  .option('--props <json>', 'input props JSON string')
  .option('--composition <id>', 'composition ID override')
  .action(async (opts) => {
    const spinner = ora('Loading scene config...').start();

    let scene;
    try {
      scene = await loadScene('.');
    } catch {
      spinner.fail('No animate.json found in current directory');
      log.dim('Run "oanim init" to scaffold a project, or create animate.json manually.');
      process.exit(1);
    }

    // Merge CLI overrides
    const fps = opts.fps ?? scene.render.fps;
    const codec = opts.codec ?? scene.render.codec;
    const compositionId = opts.composition ?? scene.compositionId;
    const crf = scene.render.crf;

    let width = scene.render.width;
    let height = scene.render.height;
    if (opts.res) {
      const [w, h] = opts.res.split('x').map(Number);
      if (w && h) {
        width = w;
        height = h;
      }
    }

    const outExt = codec === 'vp8' || codec === 'vp9' ? 'webm' : 'mp4';
    const outPath = opts.out ?? `out/${compositionId}.${outExt}`;

    // Merge props
    let props = scene.props;
    if (opts.props) {
      try {
        props = { ...props, ...JSON.parse(opts.props) };
      } catch {
        spinner.fail('Invalid --props JSON');
        process.exit(1);
      }
    }

    spinner.text = `Rendering ${compositionId} → ${outPath}`;

    const args = [
      'remotion',
      'render',
      compositionId,
      outPath,
      `--codec=${codec}`,
      `--crf=${crf}`,
    ];

    if (Object.keys(props).length > 0) {
      args.push(`--props=${JSON.stringify(JSON.stringify(props))}`);
    }

    try {
      execSync(`npx ${args.join(' ')}`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      spinner.succeed('Render complete');

      const fullPath = resolve(outPath);
      if (existsSync(fullPath)) {
        const stats = statSync(fullPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
        console.log();
        keyValue({
          Output: fullPath,
          Size: `${sizeMB} MB`,
          Resolution: `${width}x${height}`,
          FPS: String(fps),
          Codec: codec,
        });
      }
    } catch (err) {
      spinner.fail('Render failed');
      process.exit(1);
    }
  });
