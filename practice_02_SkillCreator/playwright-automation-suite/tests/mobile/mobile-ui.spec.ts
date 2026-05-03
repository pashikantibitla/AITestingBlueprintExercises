import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Responsive Layout', () => {
    // This test uses the 'Mobile Safari' project configuration from playwright.config.ts
    test('Header should be collapsed on mobile view', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'This test is only for mobile viewports');

        await page.goto('/');
        const menuButton = page.locator('.mobile-menu-button');
        const desktopNav = page.locator('.desktop-nav');

        await expect(menuButton).toBeVisible();
        await expect(desktopNav).toBeHidden();
    });
});
