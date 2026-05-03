import { Page } from '@playwright/test';
import { VWOLoginPage } from '@pages/vwo';

/**
 * VWO Login Module
 * Business workflow layer for VWO authentication scenarios.
 *
 * STRICT RULE: Page is accepted as METHOD parameter (NOT constructor)
 * to ensure test isolation and avoid shared state.
 */
export class VWOLoginModule {
  async loginWithInvalidCredentials(
    page: Page,
    username: string,
    password: string,
  ): Promise<string> {
    const loginPage = new VWOLoginPage(page);

    await loginPage.navigate();
    await loginPage.enterUsername(username);
    await loginPage.enterPassword(password);
    await loginPage.clickSignIn();

    return loginPage.getErrorMessage();
  }

  async loginWithValidCredentials(
    page: Page,
    username: string,
    password: string,
  ): Promise<void> {
    const loginPage = new VWOLoginPage(page);

    await loginPage.navigate();
    await loginPage.enterUsername(username);
    await loginPage.enterPassword(password);
    await loginPage.clickSignIn();
  }
}
