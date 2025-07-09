import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    silent: false,
    coverage: {
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
    },
  },
});
