import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly captchaImage: Locator;
    readonly captchaInput: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('#username');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('#login-button');
        this.errorMessage = page.locator('.error-message');
        this.captchaImage = page.locator('img[alt*="captcha"]'); // Specific to the OKTA style
        this.captchaInput = page.locator('input[name="captcha-answer"]');
    }

    async solveAndSubmitCaptcha(answer: string) {
        await this.captchaInput.fill(answer);
        await this.loginButton.click();
    }

    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}
