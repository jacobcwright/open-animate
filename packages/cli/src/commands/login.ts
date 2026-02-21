import { Command } from 'commander';
import { createServer } from 'node:http';
import ora from 'ora';
import open from 'open';
import { saveCredentials, getApiUrl } from '../lib/config';
import { HttpClient } from '../lib/http';
import { log } from '../lib/output';

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

function waitForCallback(port: number, timeoutMs = 120_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      server.close();
      reject(new Error('Login timed out after 2 minutes. Please try again.'));
    }, timeoutMs);

    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
      const key = url.searchParams.get('key');

      if (url.pathname === '/callback' && key) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
          '<html><body style="font-family:system-ui;text-align:center;padding:60px">' +
            '<h1>Logged in!</h1><p>You can close this window and return to the terminal.</p>' +
            '</body></html>',
        );
        clearTimeout(timer);
        server.close();
        resolve(key);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing key');
      }
    });

    server.listen(port, '127.0.0.1');
    server.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

export const loginCommand = new Command('login')
  .description('Authenticate with the oanim platform')
  .option('--token <key>', 'Authenticate with an API key (for agents and CI)')
  .action(async (opts: { token?: string }) => {
    const spinner = ora('Starting login...').start();

    try {
      if (opts.token) {
        // Headless auth — verify the key then save
        spinner.text = 'Verifying API key...';
        const client = new HttpClient();
        client.setAuth(opts.token);
        const me = await client.request<{ email: string }>('GET', '/api/v1/auth/me');
        await saveCredentials({ api_key: opts.token });
        spinner.succeed(`Logged in as ${me.email}`);
        return;
      }

      // Browser OAuth flow
      const port = await findAvailablePort();
      const apiUrl = await getApiUrl();
      const loginUrl = `${apiUrl}/api/v1/auth/cli/login?port=${port}`;

      spinner.text = 'Opening browser for authentication...';
      await open(loginUrl);

      spinner.text = 'Waiting for authentication (press Ctrl+C to cancel)...';
      const apiKey = await waitForCallback(port);

      spinner.text = 'Verifying credentials...';
      await saveCredentials({ api_key: apiKey });

      const client = new HttpClient();
      client.setAuth(apiKey);
      const me = await client.request<{ email: string }>('GET', '/api/v1/auth/me');
      spinner.succeed(`Logged in as ${me.email}`);
    } catch (err) {
      spinner.fail('Login failed');
      log.error(String(err));
      process.exit(1);
    }
  });
