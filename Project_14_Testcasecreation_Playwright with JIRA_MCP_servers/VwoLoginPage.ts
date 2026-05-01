import { Page, Locator, expect } from '@playwright/test';

export class VwoLoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly rememberMeCheckbox: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('input#login-username, input#email, [name="login-username"]');
        this.passwordInput = page.locator('input#login-password, input#password, [name="login-password"]');
        this.submitButton = page.locator('button[type="submit"], #js-login-btn');
        this.rememberMeCheckbox = page.locator('input#remember-me, [name="remember-me"], [type="checkbox"]');
        this.errorMessage = page.locator('.notification-box-description, .error-message, .invalid-credentials');
    }

    async navigate(locale: string = 'en') {
        const url = locale !== 'en' ? `https://app.vwo.com/#/login?lang=${locale}` : 'https://app.vwo.com/#/login';
        await this.page.goto(url, { waitUntil: 'networkidle' });
    }

    async login(email: string, password: string, rememberMe: boolean = false) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        
        if (rememberMe) {
            await this.rememberMeCheckbox.check();
        }
        
        await this.submitButton.click();
    }

    async getErrorMessage() {
        // Wait for the error message to be visible and return its text
        await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
        return await this.errorMessage.textContent();
    }
}
