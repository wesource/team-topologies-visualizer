import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['*.js'],
      exclude: ['*.test.js', '*.config.js', 'vitest.config.js'],
    },
  },
});
