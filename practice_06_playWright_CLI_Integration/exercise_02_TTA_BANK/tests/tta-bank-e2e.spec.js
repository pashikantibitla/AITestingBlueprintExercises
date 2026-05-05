/**
 * TTA Bank - End-to-End Test Suite
 * URL: https://tta-bank-digital-973242068062.us-west1.run.app/
 *
 * Scenarios:
 * 1. Sign up with random dummy user
 * 2. Verify $50,000 initial balance
 * 3. Transfer $5,000 via Transfer Funds tab → Continue → Confirm Transfer
 * 4. Verify $45,000 balance after transfer
 * 5. Sign out
 */

const { test, expect } = require('@playwright/test');

// Utility: Generate random test data
function generateRandomUser() {
  const ts = Date.now();
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Hannah'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  return {
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    email: `testuser_${ts}@example.com`,
    password: 'TestPassword123!'
  };
}

test.describe('TTA Bank - Full User Journey', () => {
  test('should signup, verify 50K balance, transfer 5K, verify 45K, and signout', async ({ page }) => {
    const user = generateRandomUser();
    console.log('Generated user:', user);

    // ========== STEP 1: Navigate to TTA Bank ==========
    await test.step('Navigate to landing page', async () => {
      await page.goto('https://tta-bank-digital-973242068062.us-west1.run.app/');
      await expect(page).toHaveTitle(/TTA Bank/);
      await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    });

    // ========== STEP 2: Sign Up ==========
    await test.step('Create account with dummy details', async () => {
      await page.getByRole('button', { name: 'Sign Up' }).click();

      // Fill signup form
      await page.locator('input[type="text"]').first().fill(user.name);
      await page.locator('input[type="email"]').first().fill(user.email);
      await page.locator('input[type="password"]').first().fill(user.password);

      await page.getByRole('button', { name: 'Create Account' }).click();

      // Wait for dashboard to load
      await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });
    });

    // ========== STEP 3: Verify $50,000 Balance ==========
    await test.step('Verify initial balance is $50,000', async () => {
      await expect(page.locator('body')).toContainText('$50,000.00');
    });

    // ========== STEP 4: Transfer $5,000 ==========
    await test.step('Transfer $5,000 via Transfer Funds tab', async () => {
      // Navigate to Transfer Funds
      await page.getByRole('button', { name: 'Transfer Funds' }).click();
      await expect(page.locator('input[type="number"]')).toBeVisible();

      // Fill amount
      await page.locator('input[type="number"]').first().fill('5000');

      // Optional: fill note
      const noteInput = page.locator('input[type="text"]').first();
      if (await noteInput.isVisible().catch(() => false)) {
        await noteInput.fill('Test transfer');
      }

      // Click Continue to proceed to review
      await page.getByRole('button', { name: 'Continue' }).click();

      // Wait for review page with Confirm Transfer button
      await expect(page.getByRole('button', { name: 'Confirm Transfer' })).toBeVisible({ timeout: 10000 });

      // Click Confirm Transfer to execute
      await page.getByRole('button', { name: 'Confirm Transfer' }).click();

      // Wait for transfer completion
      await page.waitForTimeout(2000);
    });

    // ========== STEP 5: Verify $45,000 Balance ==========
    await test.step('Verify balance is $45,000 after transfer', async () => {
      // Navigate back to dashboard
      await page.getByRole('button', { name: 'Dashboard' }).click();
      await page.waitForTimeout(1500);

      // Assert balance decreased to $45,000
      await expect(page.locator('body')).toContainText('$45,000.00');
    });

    // ========== STEP 6: Sign Out ==========
    await test.step('Sign out successfully', async () => {
      await page.getByRole('button', { name: 'Sign Out' }).click();
      await page.waitForTimeout(1500);

      // Verify redirect to login page
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    });
  });
});
