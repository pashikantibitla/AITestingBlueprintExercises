import { Page, Locator, expect } from '@playwright/test';

/**
 * VWO Login Page Object
 * Migrated from: LoginPage_PF.java (PageFactory pattern)
 *
 * LOCATOR STRATEGY:
 * - Uses getByRole where semantically appropriate (button)
 * - Falls back to ID-based locators for inputs (VWO app lacks data-testid)
 * - TODO: Migrate to getByTestId after adding data-testid attributes to VWO app
 */
export class VWOLoginPage {
  constructor(private readonly page: Page) {}

  // ============================================
  // LOCATORS (arrow functions)
  // ============================================

  /** @deprecated Migrate to getByTestId after adding data-testid to app */
  usernameInput = (): Locator => this.page.locator('#login-username');

  /** @deprecated Migrate to getByTestId after adding data-testid to app */
  passwordInput = (): Locator => this.page.locator('input[name="password"]');

  signInButton = (): Locator =>
    this.page.getByRole('button', { name: 'Sign in', exact: true });

  /** @deprecated Migrate to getByTestId after adding data-testid to app */
  errorMessage = (): Locator => this.page.locator('#js-notification-box-msg');

  // ============================================
  // ACTIONS
  // ============================================

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput().fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput().fill(password);
  }

  async clickSignIn(): Promise<void> {
    await this.signInButton().click();
  }

  /**
   * Gets the error message text.
   * Uses expect().toBeVisible() to auto-wait for the async DOM update
   * instead of a hard sleep (replaced original Selenium Thread.sleep).
   */
  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage()).toBeVisible();
    return (await this.errorMessage().textContent()) ?? '';
  }

  // ============================================
  // ASSERTIONS
  // ============================================

  async expectErrorMessageVisible(): Promise<void> {
    await expect(this.errorMessage()).toBeVisible();
  }

  async expectErrorMessageContains(expectedText: string): Promise<void> {
    await expect(this.errorMessage()).toContainText(expectedText);
  }
}
