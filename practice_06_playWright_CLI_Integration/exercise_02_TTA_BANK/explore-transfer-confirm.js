const { chromium } = require('playwright');
const fs = require('fs');

function randomEmail() {
  const ts = Date.now();
  return `testuser_${ts}@example.com`;
}

function randomName() {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const user = { name: randomName(), email: randomEmail(), password: 'TestPassword123!' };
  console.log('User:', user);

  // Sign up
  await page.goto('https://tta-bank-digital-973242068062.us-west1.run.app/');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.locator('input[type="text"]').first().fill(user.name);
  await page.locator('input[type="email"]').first().fill(user.email);
  await page.locator('input[type="password"]').first().fill(user.password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'exploration/confirm-step1-dashboard.png', fullPage: true });

  // Transfer
  await page.getByRole('button', { name: 'Transfer Funds' }).click();
  await page.waitForTimeout(1500);
  await page.locator('input[type="number"]').first().fill('5000');

  await page.screenshot({ path: 'exploration/confirm-step2-transfer-form.png', fullPage: true });

  // Click Continue
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'exploration/confirm-step3-after-continue.png', fullPage: true });
  console.log('After Continue - body text snippet:', (await page.locator('body').textContent()).substring(0, 500));

  // Click Confirm Transfer
  const confirmBtn = page.getByRole('button', { name: 'Confirm Transfer' });
  console.log('Confirm Transfer visible:', await confirmBtn.isVisible().catch(() => false));
  if (await confirmBtn.isVisible().catch(() => false)) {
    await confirmBtn.click();
    console.log('Clicked Confirm Transfer');
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'exploration/confirm-step4-after-confirm.png', fullPage: true });

  const afterConfirmText = await page.locator('body').textContent();
  fs.writeFileSync('exploration/confirm-after-confirm-text.txt', afterConfirmText);
  console.log('\nAfter Confirm - body text snippet:', afterConfirmText.substring(0, 500));

  // Go to Dashboard
  await page.getByRole('button', { name: 'Dashboard' }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'exploration/confirm-step5-dashboard-after-transfer.png', fullPage: true });

  const dashboardText = await page.locator('body').textContent();
  console.log('\nDashboard balance:', dashboardText.match(/Total Balance[^\$]*\$([\d,]+\.?\d*)/i)?.[0]);
  console.log('Has 45K:', /45[,\s]?000|45K/i.test(dashboardText));

  await browser.close();
})();
