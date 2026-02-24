import { Command } from 'commander';
import open from 'open';
import { clearCredentials, getApiUrl } from '../lib/config';
import { log } from '../lib/output';

export const logoutCommand = new Command('logout')
  .description('Clear stored credentials and sign out of the browser')
  .action(async () => {
    await clearCredentials();

    // Open browser to sign out of Clerk session
    try {
      const apiUrl = await getApiUrl();
      await open(`${apiUrl}/api/v1/auth/cli/logout`);
    } catch {
      // Browser sign-out is best-effort
    }

    log.success('Logged out. Credentials cleared.');
  });
