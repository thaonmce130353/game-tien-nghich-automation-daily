import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  reporter: 'list',
  outputDir: 'test-results',
  use: {
    headless: false,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  }
});