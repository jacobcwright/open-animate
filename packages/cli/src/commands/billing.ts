import { Command } from 'commander';
import { createServer } from 'node:http';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { HttpClient } from '../lib/http';
import { log, table } from '../lib/output';

interface Balance {
  creditBalanceUsd: number;
}

interface Payment {
  id: string;
  amountUsd: number;
  creditsUsd: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

interface PaymentHistory {
  payments: Payment[];
  totalPurchasedUsd: number;
}

interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

const MIN_AMOUNT = 5;
const BONUS_THRESHOLD = 50;
const BONUS_PERCENT = 10;

function findAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        server.close();
        reject(new Error('Could not find available port'));
        return;
      }
      const port = addr.port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

function waitForCallback(port: number, timeoutMs = 300_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      server.close();
      reject(new Error('Payment timed out after 5 minutes.'));
    }, timeoutMs);

    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
      const status = url.searchParams.get('status');

      if (url.pathname === '/callback' && status) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
          '<html><body style="font-family:system-ui;text-align:center;padding:60px">' +
            '<h1>Done!</h1><p>You can close this window and return to the terminal.</p>' +
            '</body></html>',
        );
        clearTimeout(timer);
        server.close();
        resolve(status);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing status');
      }
    });

    server.listen(port, '127.0.0.1');
    server.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

export const billingCommand = new Command('billing')
  .description('Manage credits and purchases')
  .action(async () => {
    try {
      const client = new HttpClient();

      const [balance, history] = await Promise.all([
        client.request<Balance>('GET', '/api/v1/usage/balance'),
        client.request<PaymentHistory>('GET', '/api/v1/billing/history?limit=5'),
      ]);

      console.log();
      console.log(
        `  ${chalk.dim('Balance:')} ${chalk.bold(`$${balance.creditBalanceUsd.toFixed(2)}`)}`,
      );

      if (balance.creditBalanceUsd < 1) {
        console.log(
          `  ${chalk.yellow('⚠')} Low balance — run ${chalk.bold('oanim billing buy --amount 10')} to add credits`,
        );
      }

      console.log();

      if (history.payments.length === 0) {
        log.dim('  No purchases yet.');
      } else {
        console.log(chalk.dim('  Recent purchases:'));
        console.log();
        table(
          ['Date', 'Amount', 'Credits', 'Status'],
          history.payments.map((p) => [
            new Date(p.createdAt).toLocaleDateString(),
            `$${p.amountUsd.toFixed(2)}`,
            `$${p.creditsUsd.toFixed(2)}`,
            p.status === 'completed'
              ? chalk.green(p.status)
              : p.status === 'failed'
                ? chalk.red(p.status)
                : chalk.yellow(p.status),
          ]),
        );

        if (history.totalPurchasedUsd > 0) {
          console.log();
          console.log(
            `  ${chalk.dim('Total purchased:')} $${history.totalPurchasedUsd.toFixed(2)}`,
          );
        }
      }

      console.log();
    } catch (err) {
      log.error(String(err));
      process.exit(1);
    }
  });

billingCommand
  .command('buy')
  .description('Purchase credits via Stripe')
  .option('-a, --amount <amount>', 'Dollar amount to purchase (minimum $5, 10% bonus over $50)')
  .action(async (opts: { amount?: string }) => {
    if (!opts.amount) {
      console.log();
      console.log(chalk.bold('  Purchase credits'));
      console.log();
      console.log(`  ${chalk.dim('Minimum:')} $${MIN_AMOUNT}`);
      console.log(`  ${chalk.dim('Bonus:')}   Spend $${BONUS_THRESHOLD}+ and get ${BONUS_PERCENT}% extra credits`);
      console.log();
      console.log(
        chalk.dim('  Usage: ') + chalk.bold('oanim billing buy --amount 25'),
      );
      console.log(
        chalk.dim('  Example: ') +
          `$100 → $${(100 * (1 + BONUS_PERCENT / 100)).toFixed(0)} in credits`,
      );
      console.log();
      return;
    }

    const amount = parseFloat(opts.amount);
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT) {
      log.error(`Minimum purchase is $${MIN_AMOUNT}.`);
      process.exit(1);
    }

    const credits = amount >= BONUS_THRESHOLD ? amount * (1 + BONUS_PERCENT / 100) : amount;
    const bonusNote = amount >= BONUS_THRESHOLD ? ` (${BONUS_PERCENT}% bonus → $${credits.toFixed(2)} credits)` : '';
    const spinner = ora(`Starting $${amount.toFixed(2)} checkout${bonusNote}...`).start();

    try {
      const port = await findAvailablePort();
      const client = new HttpClient();

      spinner.text = 'Creating checkout session...';
      const checkout = await client.request<CheckoutResponse>('POST', '/api/v1/billing/checkout', {
        body: { amount: Math.round(amount * 100) / 100, port },
      });

      if (!checkout.checkoutUrl) {
        throw new Error('No checkout URL returned');
      }

      spinner.stop();
      console.log();
      console.log(`  ${chalk.dim('Checkout:')} ${checkout.checkoutUrl}`);
      console.log();
      spinner.start('Opening browser for payment...');
      await open(checkout.checkoutUrl);

      spinner.text = 'Waiting for payment (press Ctrl+C to cancel)...';
      const status = await waitForCallback(port);

      if (status === 'success') {
        spinner.text = 'Verifying payment...';
        const balance = await client.request<Balance>('GET', '/api/v1/usage/balance');
        spinner.stop();
        log.success(
          `Payment successful! New balance: ${chalk.bold(`$${balance.creditBalanceUsd.toFixed(2)}`)}`,
        );
      } else {
        spinner.stop();
        log.warn('Payment was cancelled. No charges were made.');
      }
    } catch (err) {
      spinner.fail('Payment failed');
      log.error(String(err));
      process.exit(1);
    }
  });
