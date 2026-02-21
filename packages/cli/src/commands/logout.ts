import { Command } from 'commander';
import { clearCredentials } from '../lib/config';
import { log } from '../lib/output';

export const logoutCommand = new Command('logout')
  .description('Clear stored credentials')
  .action(async () => {
    await clearCredentials();
    log.success('Logged out. Credentials cleared.');
  });
