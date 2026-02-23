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
    chalk.bold.hex('#FF8000')('oanim') + chalk.dim(' — motion graphics CLI'),
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

const brand = gradient(['#FF8000', '#FFB800', '#FF6000']);

export function splashBanner(): void {
  console.log(brand.multiline(SPLASH_ART));
  console.log();
  console.log(chalk.dim('  motion graphics CLI + animation presets'));
  console.log();
}

export function table(headers: string[], rows: string[][]): void {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length)),
  );

  const header = headers.map((h, i) => chalk.bold(h.padEnd(widths[i]))).join('  ');
  const separator = widths.map((w) => chalk.dim('─'.repeat(w))).join('  ');

  console.log(`  ${header}`);
  console.log(`  ${separator}`);
  for (const row of rows) {
    const line = row.map((cell, i) => cell.padEnd(widths[i])).join('  ');
    console.log(`  ${line}`);
  }
}
