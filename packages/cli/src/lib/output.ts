import chalk from 'chalk';
import gradient from 'gradient-string';

export const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.error(chalk.red('✗'), msg),
  dim: (msg: string) => console.log(chalk.dim(msg)),
};

export function keyValue(pairs: Record<string, string | number>): void {
  for (const [key, value] of Object.entries(pairs)) {
    console.log(`  ${chalk.dim(key + ':')} ${value}`);
  }
}

export function banner(): void {
  console.log(
    chalk.bold.hex('#6366f1')('oanim') + chalk.dim(' — motion graphics CLI'),
  );
  console.log();
}

const SPLASH_ART = `
             ██████  ██████  ███████ ███    ██
            ██    ██ ██   ██ ██      ████   ██
            ██    ██ ██████  █████   ██ ██  ██
            ██    ██ ██      ██      ██  ██ ██
             ██████  ██      ███████ ██   ████
 █████  ███    ██ ██ ███    ███  █████  ████████ ███████
██   ██ ████   ██ ██ ████  ████ ██   ██    ██    ██
███████ ██ ██  ██ ██ ██ ████ ██ ███████    ██    █████
██   ██ ██  ██ ██ ██ ██  ██  ██ ██   ██    ██    ██
██   ██ ██   ████ ██ ██      ██ ██   ██    ██    ███████`.slice(1); // remove leading newline

const brand = gradient(['#6366f1', '#8b5cf6', '#d946ef']);

export function splashBanner(): void {
  console.log(brand.multiline(SPLASH_ART));
  console.log();
  console.log(chalk.dim('  motion graphics CLI + animation presets'));
  console.log();
}
