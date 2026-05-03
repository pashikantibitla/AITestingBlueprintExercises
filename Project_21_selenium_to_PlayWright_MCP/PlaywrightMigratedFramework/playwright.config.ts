import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

/**
 * RCA: Missing playwright.config.ts caused `page.goto('/')` to fail
 * because no baseURL was defined. Playwright needs baseURL to resolve
 * relative URLs like '/'. Without it, the page navigates to 'about:blank'.
 */
dotenv.config();

export default defineConfig({
  testDir: './src/tests',
  timeout: 60000,
  expect: { timeout: 10000 },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 2 : 3,

  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.VWO_BASE_URL || 'https://app.vwo.com',

    /* Collect trace when retrying the failed test */
    trace: 'retain-on-failure',

    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
