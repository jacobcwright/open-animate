import { Command } from 'commander';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execSync } from 'node:child_process';
import ora from 'ora';
import { log, keyValue } from '../lib/output';

const DEFAULT_SCENE = {
  name: 'My Video',
  compositionId: 'MyComp',
  render: {
    fps: 30,
    width: 1920,
    height: 1080,
    codec: 'h264',
    crf: 18,
  },
  props: {},
};

const ROOT_TSX = `import React from 'react';
import { Composition } from 'remotion';
import { MyComp } from './MyComp';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyComp"
      component={MyComp}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
`;

const MY_COMP_TSX = `import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fadeUp, Background, SafeArea, palettes } from '@oanim/core';

const colors = palettes.dark;

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background gradient={\`linear-gradient(135deg, \${colors.bg}, \${colors.bgAlt})\`} />
      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.2 }),
            fontSize: 80,
            fontWeight: 700,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Hello, oanim
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
`;

const INDEX_TS = `import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
`;

function detectPm(): 'pnpm' | 'npm' | 'yarn' {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch {
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      return 'yarn';
    } catch {
      return 'npm';
    }
  }
}

export const initCommand = new Command('init')
  .argument('[name]', 'project name', 'my-video')
  .description('Scaffold a new Remotion project with oanim presets')
  .action(async (name: string) => {
    const projectDir = resolve(process.cwd(), name);

    const spinner = ora('Scaffolding project...').start();

    try {
      // Create directory structure
      await mkdir(join(projectDir, 'src'), { recursive: true });
      await mkdir(join(projectDir, 'public'), { recursive: true });

      // Write package.json
      const pkg = {
        name,
        version: '0.1.0',
        private: true,
        scripts: {
          studio: 'remotion studio',
          render: 'oanim render',
          build: 'remotion render MyComp out/video.mp4',
        },
        dependencies: {
          '@oanim/core': '^0.1.0',
          '@remotion/cli': '^4.0.0',
          '@remotion/transitions': '^4.0.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          remotion: '^4.0.0',
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          typescript: '^5.5.0',
        },
      };
      await writeFile(
        join(projectDir, 'package.json'),
        JSON.stringify(pkg, null, 2) + '\n',
      );

      // Write tsconfig
      const tsconfig = {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
        },
        include: ['src'],
      };
      await writeFile(
        join(projectDir, 'tsconfig.json'),
        JSON.stringify(tsconfig, null, 2) + '\n',
      );

      // Write source files
      await writeFile(join(projectDir, 'src', 'index.ts'), INDEX_TS);
      await writeFile(join(projectDir, 'src', 'Root.tsx'), ROOT_TSX);
      await writeFile(join(projectDir, 'src', 'MyComp.tsx'), MY_COMP_TSX);

      // Write scene.json
      await writeFile(
        join(projectDir, 'scene.json'),
        JSON.stringify(DEFAULT_SCENE, null, 2) + '\n',
      );

      spinner.succeed('Project scaffolded');

      // Detect package manager and install
      const pm = detectPm();
      const installSpinner = ora(`Installing dependencies with ${pm}...`).start();

      try {
        execSync(`${pm} install`, {
          cwd: projectDir,
          stdio: 'pipe',
        });
        installSpinner.succeed('Dependencies installed');
      } catch {
        installSpinner.warn('Could not auto-install. Run install manually.');
      }

      console.log();
      log.success(`Created ${name}/`);
      keyValue({
        Preview: `cd ${name} && npx remotion studio`,
        Render: `cd ${name} && oanim render`,
      });
    } catch (err) {
      spinner.fail('Failed to scaffold project');
      log.error(String(err));
      process.exit(1);
    }
  });
