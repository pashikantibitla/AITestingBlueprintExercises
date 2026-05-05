const { chromium } = require('playwright');
const fs = require('fs');

function randomEmail() {
  const ts = Date.now();
  return `testuser_${ts}@example.com`;
}

function randomName() {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Hannah'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const user = {
    name: randomName(),
    email: randomEmail(),
    password: 'TestPassword123!'
  };
  fs.writeFileSync('exploration/test-user2.json', JSON.stringify(user, null, 2));
  console.log('Test user:', user);

  // ========== STEP 1: Navigate and Sign Up ==========
  console.log('\n=== STEP 1: Navigate to TTA Bank ===');
  await page.goto('https://tta-bank-digital-973242068062.us-west1.run.app/');
  await page.waitForLoadState('networkidle');

  console.log('\n=== STEP 2: Sign Up ===');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.waitForTimeout(1500);

  // Fill signup form
  await page.locator('input[type="text"]').first().fill(user.name);
  await page.locator('input[type="email"]').first().fill(user.email);
  await page.locator('input[type="password"]').first().fill(user.password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  // Wait for dashboard to load
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'exploration/flow-step1-dashboard.png', fullPage: true });
  console.log('Screenshot: flow-step1-dashboard.png');

  // ========== STEP 3: Verify 50K Balance ==========
  console.log('\n=== STEP 3: Verify 50K Balance ===');
  const dashboardText = await page.locator('body').textContent();
  const has50k = /50[,\s]?000|50K/i.test(dashboardText);
  console.log('Has 50K balance:', has50k);

  // Try to get exact balance text
  const balanceMatches = dashboardText.match(/\$50[,\s]?000(?:\.00)?/gi);
  console.log('Balance matches:', balanceMatches);

  // ========== STEP 4: Go to Transfer Funds ==========
  console.log('\n=== STEP 4: Click Transfer Funds ===');
  await page.getByRole('button', { name: 'Transfer Funds' }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'exploration/flow-step2-transfer-page.png', fullPage: true });
  console.log('Screenshot: flow-step2-transfer-page.png');

  // ========== STEP 5: Fill Transfer Form ==========
  console.log('\n=== STEP 5: Fill Transfer Form ===');

  // Get all inputs and selects
  const inputs = await page.locator('input').all();
  const selects = await page.locator('select').all();

  console.log('Inputs found:', inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const type = await inputs[i].getAttribute('type').catch(() => '');
    const placeholder = await inputs[i].getAttribute('placeholder').catch(() => '');
    console.log(`  [${i}] type="${type}" placeholder="${placeholder}"`);
  }

  console.log('Selects found:', selects.length);
  for (let i = 0; i < selects.length; i++) {
    const options = await selects[i].locator('option').all();
    const texts = await Promise.all(options.map(o => o.textContent()));
    console.log(`  Select[${i}] options:`, texts);
  }

  // Fill amount - look for number input
  const amountInput = page.locator('input[type="number"]').first();
  await amountInput.fill('5000');
  console.log('Filled amount: 5000');

  // Optionally fill note
  const noteInput = page.locator('input[type="text"]').filter({ hasText: '' }).first();
  if (await noteInput.isVisible().catch(() => false)) {
    await noteInput.fill('Test transfer');
  }

  await page.screenshot({ path: 'exploration/flow-step3-form-filled.png', fullPage: true });
  console.log('Screenshot: flow-step3-form-filled.png');

  // ========== STEP 6: Click Continue / Submit ==========
  console.log('\n=== STEP 6: Submit Transfer ===');

  // Find Continue or Transfer button
  const continueBtn = page.getByRole('button', { name: 'Continue' });
  const transferBtn = page.getByRole('button', { name: 'Transfer' });

  if (await continueBtn.isVisible().catch(() => false)) {
    console.log('Clicking Continue...');
    await continueBtn.click();
  } else if (await transferBtn.isVisible().catch(() => false)) {
    console.log('Clicking Transfer...');
    await transferBtn.click();
  } else {
    // Find any button that might submit
    const allBtns = await page.locator('button').all();
    for (const btn of allBtns) {
      const text = await btn.textContent().catch(() => '');
      if (/continue|transfer|submit|confirm|send/i.test(text?.trim())) {
        console.log('Clicking button:', text?.trim());
        await btn.click();
        break;
      }
    }
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'exploration/flow-step4-after-transfer-submit.png', fullPage: true });
  console.log('Screenshot: flow-step4-after-transfer-submit.png');

  // ========== STEP 7: Verify 45K Balance ==========
  console.log('\n=== STEP 7: Verify 45K Balance ===');

  // Navigate back to dashboard if needed
  const dashboardBtn = page.getByRole('button', { name: 'Dashboard' });
  if (await dashboardBtn.isVisible().catch(() => false)) {
    await dashboardBtn.click();
    await page.waitForTimeout(2000);
  }

  const afterText = await page.locator('body').textContent();
  fs.writeFileSync('exploration/flow-after-transfer-text.txt', afterText);

  const has45k = /45[,\s]?000|45K/i.test(afterText);
  console.log('Has 45K balance:', has45k);

  const balanceAfterMatches = afterText.match(/\$45[,\s]?000(?:\.00)?/gi);
  console.log('45K Balance matches:', balanceAfterMatches);

  const currentBalanceMatch = afterText.match(/Total Balance[^\$]*\$([\d,]+\.?\d*)/i);
  console.log('Current balance match:', currentBalanceMatch);

  await page.screenshot({ path: 'exploration/flow-step5-balance-check.png', fullPage: true });
  console.log('Screenshot: flow-step5-balance-check.png');

  // ========== STEP 8: Sign Out ==========
  console.log('\n=== STEP 8: Sign Out ===');
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'exploration/flow-step6-signout.png', fullPage: true });
  console.log('Screenshot: flow-step6-signout.png');

  await browser.close();
  console.log('\nTransfer flow exploration complete!');
})();
