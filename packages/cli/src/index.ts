import { Command } from 'commander';
import { banner } from './lib/output';
import { initCommand } from './commands/init';
import { renderCommand } from './commands/render';
import { assetsCommand } from './commands/assets';
import { loginCommand } from './commands/login';
import { whoamiCommand } from './commands/whoami';
import { logoutCommand } from './commands/logout';
import { apiKeysCommand } from './commands/api-keys';
import { usageCommand } from './commands/usage';
import { billingCommand } from './commands/billing';

const SKIP_BANNER = new Set(['init', 'login', 'logout', 'whoami', 'api-keys', 'usage', 'billing']);

const program = new Command()
  .name('oanim')
  .version('0.1.0')
  .description('Motion graphics CLI — animation presets + Remotion workflow')
  .hook('preAction', (_thisCommand, actionCommand) => {
    if (!SKIP_BANNER.has(actionCommand.name())) {
      banner();
    }
  });

program.addCommand(initCommand);
program.addCommand(renderCommand);
program.addCommand(assetsCommand);
program.addCommand(loginCommand);
program.addCommand(whoamiCommand);
program.addCommand(logoutCommand);
program.addCommand(apiKeysCommand);
program.addCommand(usageCommand);
program.addCommand(billingCommand);

program.parse();
