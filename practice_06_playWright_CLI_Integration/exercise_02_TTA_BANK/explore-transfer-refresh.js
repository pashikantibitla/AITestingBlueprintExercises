const { chromium } = require('playwright');

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

  console.log('Balance after signup:', (await page.locator('body').textContent()).match(/Total Balance[^\$]*\$([\d,]+\.?\d*)/i)?.[0]);

  // Transfer
  await page.getByRole('button', { name: 'Transfer Funds' }).click();
  await page.waitForTimeout(1500);
  await page.locator('input[type="number"]').first().fill('5000');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(3000);

  console.log('After transfer click - URL:', page.url());
  await page.screenshot({ path: 'exploration/after-transfer-click.png', fullPage: true });

  // Check if there's a confirmation dialog or button
  const allBtns = await page.locator('button').all();
  console.log('\nButtons after Continue:');
  for (const btn of allBtns) {
    const text = await btn.textContent().catch(() => '');
    console.log(`  - "${text?.trim()}"`);
  }

  // Try clicking any confirm/send button
  for (const btn of allBtns) {
    const text = await btn.textContent().catch(() => '');
    if (/confirm|send|submit|transfer|done/i.test(text?.trim()) && text?.trim() !== 'Continue') {
      console.log('Clicking:', text?.trim());
      await btn.click();
      await page.waitForTimeout(3000);
      break;
    }
  }

  // Refresh page and check balance
  console.log('\nRefreshing page...');
  await page.reload();
  await page.waitForTimeout(3000);

  const bodyText = await page.locator('body').textContent();
  console.log('Balance after refresh:', bodyText.match(/Total Balance[^\$]*\$([\d,]+\.?\d*)/i)?.[0]);
  console.log('Has 45K:', /45[,\s]?000|45K/i.test(bodyText));

  await page.screenshot({ path: 'exploration/after-refresh.png', fullPage: true });

  await browser.close();
})();
