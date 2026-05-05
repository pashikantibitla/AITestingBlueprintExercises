/**
 * VWO Login - Invalid Credentials Test
 * Production-ready Playwright spec refined from codegen output.
 *
 * Scenario:
 * 1. Navigate to VWO login page.
 * 2. Enter an invalid username/email.
 * 3. Enter an invalid password.
 * 4. Click the Sign in button.
 * 5. Verify that an appropriate error message is displayed.
 */

const { test, expect } = require('@playwright/test');

// Test data for invalid login attempt
const INVALID_USER = {
  email: 'invalid_user@example.com',
  password: 'wrongpassword123',
};

const EXPECTED_ERROR_SNIPPET = 'Your email, password, IP address or location did not match';

test.describe('VWO Login Page - Negative Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the VWO login page before each test
    await page.goto('https://app.vwo.com/#/login');
    // Wait for the login form to be ready
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
  });

  test('should display error message for invalid username and password', async ({ page }) => {
    // Arrange & Act: Fill in invalid credentials and submit
    const emailField = page.getByRole('textbox', { name: 'Email address' });
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    const signInButton = page.getByRole('button', { name: 'Sign in', exact: true });

    await emailField.fill(INVALID_USER.email);
    await passwordField.fill(INVALID_USER.password);
    await signInButton.click();

    // Assert: Verify error notification is visible and contains expected text
    const errorNotification = page.locator('.notification-box-description');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });
    await expect(errorNotification).toContainText(EXPECTED_ERROR_SNIPPET);

    // Additional assertion: Ensure the user remains on the login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should display error message for empty username and password', async ({ page }) => {
    // Arrange & Act: Leave fields empty and submit
    const signInButton = page.getByRole('button', { name: 'Sign in', exact: true });
    await signInButton.click();

    // Assert: Verify error notification is visible
    const errorNotification = page.locator('.notification-box-description');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });
  });
});
