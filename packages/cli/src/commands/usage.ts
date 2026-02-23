import { Command } from 'commander';
import chalk from 'chalk';
import { HttpClient } from '../lib/http';
import { log, table } from '../lib/output';

interface UsageSummary {
  usage: { date: string; totalCostUsd: number; count: number }[];
  totalCostUsd: number;
}

interface UsageRecord {
  id: string;
  provider: string;
  model: string;
  operation: string;
  estimatedCostUsd: number;
  createdAt: string;
}

interface UsageRecords {
  records: UsageRecord[];
  total: number;
}

interface Balance {
  creditBalanceUsd: number;
}

export const usageCommand = new Command('usage')
  .description('View credit balance and usage history')
  .action(async () => {
    try {
      const client = new HttpClient();

      const [balance, summary] = await Promise.all([
        client.request<Balance>('GET', '/api/v1/usage/balance'),
        client.request<UsageSummary>('GET', '/api/v1/usage?days=7'),
      ]);

      console.log();
      console.log(
        `  ${chalk.dim('Balance:')} ${chalk.bold(`$${balance.creditBalanceUsd.toFixed(2)}`)}`,
      );

      if (balance.creditBalanceUsd < 1) {
        console.log(
          `  ${chalk.yellow('⚠')} Low balance — run ${chalk.bold('oanim billing buy')} to add credits`,
        );
      }

      console.log();

      if (summary.usage.length === 0) {
        log.dim('  No usage in the last 7 days.');
      } else {
        console.log(chalk.dim('  Last 7 days:'));
        console.log();
        table(
          ['Date', 'Cost', 'Requests'],
          summary.usage.map((u) => [
            u.date,
            `$${u.totalCostUsd.toFixed(4)}`,
            String(u.count),
          ]),
        );
        console.log();
        console.log(`  ${chalk.dim('Total:')} $${summary.totalCostUsd.toFixed(4)}`);
      }

      console.log();
    } catch (err) {
      log.error(String(err));
      process.exit(1);
    }
  });

usageCommand
  .command('history')
  .description('View detailed per-record usage history')
  .option('-l, --limit <n>', 'Number of records to show', '20')
  .option('-d, --days <n>', 'Number of days to look back', '30')
  .action(async (opts: { limit: string; days: string }) => {
    try {
      const client = new HttpClient();

      const [balance, data] = await Promise.all([
        client.request<Balance>('GET', '/api/v1/usage/balance'),
        client.request<UsageRecords>(
          'GET',
          `/api/v1/usage/records?limit=${opts.limit}&days=${opts.days}`,
        ),
      ]);

      console.log();
      console.log(
        `  ${chalk.dim('Balance:')} ${chalk.bold(`$${balance.creditBalanceUsd.toFixed(2)}`)}`,
      );

      if (balance.creditBalanceUsd < 1) {
        console.log(
          `  ${chalk.yellow('⚠')} Low balance — run ${chalk.bold('oanim billing buy')} to add credits`,
        );
      }

      console.log();

      if (data.records.length === 0) {
        log.dim(`  No usage records in the last ${opts.days} days.`);
      } else {
        table(
          ['Date', 'Provider', 'Model', 'Operation', 'Cost'],
          data.records.map((r) => [
            new Date(r.createdAt).toLocaleDateString(),
            r.provider,
            r.model.replace('fal-ai/', ''),
            r.operation,
            `$${r.estimatedCostUsd.toFixed(4)}`,
          ]),
        );

        const total = data.records.reduce((sum, r) => sum + r.estimatedCostUsd, 0);
        console.log();
        console.log(`  ${chalk.dim('Total:')} $${total.toFixed(4)}`);
        if (data.total > data.records.length) {
          console.log(
            chalk.dim(`  Showing ${data.records.length} of ${data.total} records`),
          );
        }
      }

      console.log();
    } catch (err) {
      log.error(String(err));
      process.exit(1);
    }
  });
