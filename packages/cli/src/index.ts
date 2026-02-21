import { Command } from 'commander';
import { banner } from './lib/output';
import { initCommand } from './commands/init';
import { renderCommand } from './commands/render';
import { assetsCommand } from './commands/assets';

const program = new Command()
  .name('oanim')
  .version('0.1.0')
  .description('Motion graphics CLI — animation presets + Remotion workflow')
  .hook('preAction', () => banner());

program.addCommand(initCommand);
program.addCommand(renderCommand);
program.addCommand(assetsCommand);

program.parse();
