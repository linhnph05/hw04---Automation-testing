import { defineConfig, devices } from '@playwright/test';

const runTimestamp = new Date().toISOString();

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: process.env.RESULTS_DIR || 'test-results',
  reporter: [
    ['list'],
    ['html', {
      open: 'never',
      outputFolder: process.env.REPORT_DIR || 'playwright-report',
      title: `Run by: 23127081 | ${runTimestamp}`,
    }],
  ],
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
