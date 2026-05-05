// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Validation config: always records video and trace for step-by-step verification
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://tta-bank-digital-973242068062.us-west1.run.app',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    headless: true,
  },
  projects: [
    {
      name: 'chromium-validation',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
