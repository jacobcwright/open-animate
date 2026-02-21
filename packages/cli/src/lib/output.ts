import chalk from 'chalk';

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
