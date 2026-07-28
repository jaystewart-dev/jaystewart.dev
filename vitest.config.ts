import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit tests live beside the code they test. `tests/` holds the Playwright
    // suite, which needs a browser and its own runner — without this, Vitest
    // collects those specs and fails on `test.describe`.
    include: ['src/**/*.test.ts'],
  },
});
