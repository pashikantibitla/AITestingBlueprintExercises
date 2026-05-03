import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { CaptchaSolver } from '../../utils/captcha-solver';

test.describe('CAPTCHA Automation', () => {
    test('User should be able to solve Okta style CAPTCHA', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const captchaSolver = new CaptchaSolver(page);

        // 1. Navigate to the page containing the CAPTCHA (Example)
        await loginPage.navigateTo('https://login.okta.com/'); // Example Okta endpoint

        // 2. Locate the CAPTCHA image and extract text
        // Based on the provided image, the text is 'Td4eva'
        const captchaText = await captchaSolver.solveImageCaptcha('img[alt*="captcha"]');

        console.log(`--- Identified Captcha Text: ${captchaText} ---`);

        // 3. Fill the captcha answer and submit
        await loginPage.solveAndSubmitCaptcha(captchaText);

        // 4. Assertion (Verify success or next step)
        await expect(page.locator('.success-banner')).toBeVisible({ timeout: 10000 });
    });
});
