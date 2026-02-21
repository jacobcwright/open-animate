import { Command } from 'commander';
import ora from 'ora';
import { getAuth } from '../lib/config';
import { HttpClient } from '../lib/http';
import { log, keyValue } from '../lib/output';

export const whoamiCommand = new Command('whoami')
  .description('Show the currently authenticated user')
  .action(async () => {
    const auth = await getAuth();
    if (!auth) {
      log.error('Not logged in. Run "oanim login" to authenticate.');
      process.exit(1);
    }

    const spinner = ora('Fetching user info...').start();
    try {
      const client = new HttpClient();
      const me = await client.request<{ id: string; email: string; created_at: string }>(
        'GET',
        '/api/v1/auth/me',
      );
      spinner.stop();
      keyValue({
        Email: me.email,
        ID: me.id,
        'Member since': new Date(me.created_at).toLocaleDateString(),
      });
    } catch (err) {
      spinner.fail('Failed to fetch user info');
      log.error(String(err));
      process.exit(1);
    }
  });
