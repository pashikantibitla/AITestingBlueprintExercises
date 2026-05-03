import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

test.describe('Login Functionality', () => {
    test('User should be able to log in with valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo('/login');
        await loginPage.login('user123', 'pass123');

        // Asserting using POM locator
        await expect(page).toHaveURL(/dashboard/);
    });

    test('User should see error with invalid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo('/login');
        await loginPage.login('wrong_user', 'wrong_pass');

        // Error handling assertion
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText('Invalid username or password');
    });
});
