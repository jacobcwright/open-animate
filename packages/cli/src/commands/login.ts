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
      const token = url.searchParams.get('token');

      if (url.pathname === '/callback' && token) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
          '<html><body style="font-family:system-ui;text-align:center;padding:60px">' +
            '<h1>Logged in!</h1><p>You can close this window and return to the terminal.</p>' +
            '</body></html>',
        );
        clearTimeout(timer);
        server.close();
        resolve(token);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing token');
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
  .action(async () => {
    const spinner = ora('Starting login...').start();

    try {
      const port = await findAvailablePort();
      const apiUrl = await getApiUrl();
      const loginUrl = `${apiUrl}/api/v1/auth/cli/login?port=${port}`;

      spinner.text = 'Opening browser for authentication...';
      await open(loginUrl);

      spinner.text = 'Waiting for authentication (press Ctrl+C to cancel)...';
      const token = await waitForCallback(port);

      spinner.text = 'Verifying credentials...';
      await saveCredentials({ token });

      const client = new HttpClient();
      client.setAuth(token);
      const me = await client.request<{ email: string }>('GET', '/api/v1/auth/me');
      spinner.succeed(`Logged in as ${me.email}`);
    } catch (err) {
      spinner.fail('Login failed');
      log.error(String(err));
      process.exit(1);
    }
  });
