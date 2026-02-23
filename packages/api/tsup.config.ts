import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2022',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  external: [
    'pg',
    'pg-boss',
    'stripe',
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    '@remotion/lambda',
  ],
});
