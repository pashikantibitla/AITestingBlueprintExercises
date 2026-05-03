import { test, expect } from '@playwright/test';
import { VWOLoginModule } from '@modules/vwo';

/**
 * Throws if environment variable is missing.
 * Prevents silent fallback to hardcoded credentials.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}. Check your .env file.`);
  }
  return value;
}

test.describe('@P1 @Regression @VWO @Login', () => {
  const creds = {
    username: requireEnv('VWO_USERNAME'),
    password: requireEnv('VWO_PASSWORD'),
    invalidUsername: requireEnv('VWO_INVALID_USERNAME'),
    invalidPassword: requireEnv('VWO_INVALID_PASSWORD'),
    expectedError: requireEnv('VWO_EXPECTED_ERROR_MESSAGE'),
  };

  test('testPass - Should pass successfully', async ({ page }) => {
    const loginModule = new VWOLoginModule();
    await loginModule.loginWithValidCredentials(page, creds.username, creds.password);
    await expect(page).toHaveURL(/app\.vwo\.com/);
  });

  test('testFail - Should trigger intentional failure for retry and screenshot testing', async () => {
    expect(true).toBe(false);
  });

  test('should display error for invalid credentials', async ({ page }) => {
    const loginModule = new VWOLoginModule();
    const errorMessage = await loginModule.loginWithInvalidCredentials(
      page,
      creds.invalidUsername,
      creds.invalidPassword,
    );
    expect(errorMessage).toBe(creds.expectedError);
  });
});
