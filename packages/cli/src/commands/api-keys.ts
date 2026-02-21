import { Command } from 'commander';
import ora from 'ora';
import { HttpClient } from '../lib/http';
import { getAuth } from '../lib/config';
import { log, keyValue } from '../lib/output';

interface ApiKeyMeta {
  id: string;
  name: string;
  prefix: string;
  created_at: number;
  last_used_at?: number;
}

interface CreateKeyResponse {
  api_key: ApiKeyMeta;
  key: string;
}

interface ListKeysResponse {
  api_keys: ApiKeyMeta[];
}

const createCommand = new Command('create')
  .description('Create a new API key')
  .requiredOption('--name <name>', 'name for the API key')
  .action(async (opts) => {
    const spinner = ora('Creating API key...').start();
    const auth = await getAuth();
    if (!auth) {
      spinner.fail('Not authenticated. Run "oanim login" first.');
      process.exit(1);
    }

    try {
      const client = new HttpClient();
      const result = await client.request<CreateKeyResponse>('POST', '/api/v1/api-keys', {
        body: { name: opts.name },
      });

      spinner.succeed('API key created');
      console.log();
      keyValue({
        Name: result.api_key.name,
        Prefix: result.api_key.prefix,
        Key: result.key,
      });
      console.log();
      log.warn('Save this key — it will not be shown again.');
      log.dim('Set it as ANIMATE_API_KEY in your environment for programmatic access.');
    } catch (err) {
      spinner.fail('Failed to create API key');
      log.error(String(err));
      process.exit(1);
    }
  });

const listCommand = new Command('list')
  .description('List your API keys')
  .action(async () => {
    const spinner = ora('Loading API keys...').start();
    const auth = await getAuth();
    if (!auth) {
      spinner.fail('Not authenticated. Run "oanim login" first.');
      process.exit(1);
    }

    try {
      const client = new HttpClient();
      const result = await client.request<ListKeysResponse>('GET', '/api/v1/api-keys');

      spinner.stop();

      if (result.api_keys.length === 0) {
        log.dim('No API keys found. Create one with "oanim api-keys create --name <name>".');
        return;
      }

      console.log();
      for (const key of result.api_keys) {
        const created = new Date(key.created_at).toLocaleDateString();
        const lastUsed = key.last_used_at
          ? new Date(key.last_used_at).toLocaleDateString()
          : 'never';
        keyValue({
          Name: key.name,
          Prefix: key.prefix,
          Created: created,
          'Last used': lastUsed,
          ID: key.id,
        });
        console.log();
      }
    } catch (err) {
      spinner.fail('Failed to list API keys');
      log.error(String(err));
      process.exit(1);
    }
  });

const revokeCommand = new Command('revoke')
  .description('Revoke an API key')
  .argument('<id>', 'API key ID to revoke')
  .action(async (id: string) => {
    const spinner = ora('Revoking API key...').start();
    const auth = await getAuth();
    if (!auth) {
      spinner.fail('Not authenticated. Run "oanim login" first.');
      process.exit(1);
    }

    try {
      const client = new HttpClient();
      await client.request('DELETE', `/api/v1/api-keys/${id}`);
      spinner.succeed('API key revoked');
    } catch (err) {
      spinner.fail('Failed to revoke API key');
      log.error(String(err));
      process.exit(1);
    }
  });

export const apiKeysCommand = new Command('api-keys')
  .description('Manage platform API keys')
  .addCommand(createCommand)
  .addCommand(listCommand)
  .addCommand(revokeCommand);
