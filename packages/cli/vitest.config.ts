import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/__tests__/**', 'src/lib/providers/types.ts'],
      thresholds: {
        lines: 92,
        functions: 94,
        branches: 82,
        statements: 92,
      },
    },
  },
});
