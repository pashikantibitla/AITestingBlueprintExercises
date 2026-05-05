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
  fs.writeFileSync('exploration/test-user.json', JSON.stringify(user, null, 2));
  console.log('Test user:', user);

  // ========== STEP 1: Navigate to landing page ==========
  console.log('\n=== STEP 1: Navigate to TTA Bank ===');
  await page.goto('https://tta-bank-digital-973242068062.us-west1.run.app/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'exploration/step1-landing-page.png', fullPage: true });
  console.log('Screenshot: step1-landing-page.png');

  // ========== STEP 2: Click Sign Up ==========
  console.log('\n=== STEP 2: Click Sign Up ===');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'exploration/step2-signup-form.png', fullPage: true });
  console.log('Screenshot: step2-signup-form.png');

  // Capture signup form inputs
  const signupInputs = await page.locator('input').all();
  console.log('Signup inputs count:', signupInputs.length);
  for (let i = 0; i < signupInputs.length; i++) {
    const type = await signupInputs[i].getAttribute('type').catch(() => '');
    const placeholder = await signupInputs[i].getAttribute('placeholder').catch(() => '');
    console.log(`  [${i}] type="${type}" placeholder="${placeholder}"`);
  }

  // ========== STEP 3: Fill signup form ==========
  console.log('\n=== STEP 3: Fill Signup Form ===');
  const textInputs = page.locator('input[type="text"]');
  const emailInputs = page.locator('input[type="email"]');
  const passwordInputs = page.locator('input[type="password"]');

  await textInputs.first().fill(user.name);
  await emailInputs.first().fill(user.email);
  await passwordInputs.first().fill(user.password);
  await page.screenshot({ path: 'exploration/step3-form-filled.png', fullPage: true });
  console.log('Screenshot: step3-form-filled.png');

  // Find and click submit button on signup form
  const submitBtn = page.locator('button[type="submit"]').first();
  const btnText = await submitBtn.textContent().catch(() => '');
  console.log('Submit button text:', btnText?.trim());
  await submitBtn.click();

  // Wait for navigation or dashboard to appear
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'exploration/step4-after-signup.png', fullPage: true });
  console.log('Screenshot: step4-after-signup.png');
  console.log('Page URL after signup:', page.url());
  console.log('Page title after signup:', await page.title());

  // ========== STEP 4: Verify 50K balance ==========
  console.log('\n=== STEP 4: Verify 50K Balance ===');
  const pageText = await page.locator('body').textContent();
  fs.writeFileSync('exploration/step4-body-text.txt', pageText);

  // Search for balance indicators
  const balanceMatch = pageText.match(/[\$\u20AC\u00A3]?[\d,]+\.?\d*\s*(K?)/gi);
  console.log('Potential balances found:', balanceMatch);

  // Check for 50,000 or 50K
  const has50k = /50[,\s]?000|50K/i.test(pageText);
  console.log('Has 50K balance:', has50k);

  // ========== STEP 5: Find Transfer Funds Tab/Link ==========
  console.log('\n=== STEP 5: Find Transfer Funds ===');
  const allButtons = await page.locator('button').all();
  const allLinks = await page.locator('a').all();

  console.log('All buttons:');
  for (const btn of allButtons) {
    const text = await btn.textContent().catch(() => '');
    console.log(`  - "${text?.trim()}"`);
  }

  console.log('All links:');
  for (const link of allLinks.slice(0, 20)) {
    const text = await link.textContent().catch(() => '');
    console.log(`  - "${text?.trim()}"`);
  }

  // Try to find Transfer Funds
  const transferKeywords = ['transfer', 'send money', 'move funds', 'payments'];
  let transferFound = false;
  for (const keyword of transferKeywords) {
    const el = page.locator('button, a').filter({ hasText: new RegExp(keyword, 'i') }).first();
    if (await el.isVisible().catch(() => false)) {
      console.log(`>>> Found transfer element: "${keyword}"`);
      await el.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'exploration/step5-transfer-page.png', fullPage: true });
      transferFound = true;
      break;
    }
  }

  if (!transferFound) {
    console.log('>>> No explicit Transfer Funds link found. Checking page structure...');
    await page.screenshot({ path: 'exploration/step5-dashboard.png', fullPage: true });
  }

  // ========== STEP 6: Try Transfer 5000 ==========
  console.log('\n=== STEP 6: Transfer $5000 ===');
  const transferInputs = await page.locator('input').all();
  console.log('Inputs on transfer/dashboard page:', transferInputs.length);
  for (let i = 0; i < transferInputs.length; i++) {
    const type = await transferInputs[i].getAttribute('type').catch(() => '');
    const placeholder = await transferInputs[i].getAttribute('placeholder').catch(() => '');
    console.log(`  [${i}] type="${type}" placeholder="${placeholder}"`);
  }

  // Try to find amount input and transfer button
  const amountInput = page.locator('input').filter({ has: page.locator('') }).or(page.locator('input[placeholder*="amount" i]'));
  // Just try filling any visible number/text input with 5000
  for (const inp of transferInputs) {
    const type = await inp.getAttribute('type').catch(() => '');
    if (type === 'number' || type === 'text') {
      const visible = await inp.isVisible().catch(() => false);
      if (visible) {
        console.log('Filling input with 5000...');
        await inp.fill('5000');
        break;
      }
    }
  }

  // Look for dropdowns
  const selects = await page.locator('select').all();
  console.log('Selects found:', selects.length);
  for (let i = 0; i < selects.length; i++) {
    const options = await selects[i].locator('option').all();
    console.log(`  Select[${i}] options:`, await Promise.all(options.map(o => o.textContent())));
  }

  // Look for transfer/submit button
  const actionButtons = await page.locator('button').all();
  for (const btn of actionButtons) {
    const text = await btn.textContent().catch(() => '');
    if (/transfer|send|submit|confirm/i.test(text)) {
      console.log('Clicking transfer button:', text?.trim());
      await btn.click();
      await page.waitForTimeout(2000);
      break;
    }
  }

  await page.screenshot({ path: 'exploration/step6-after-transfer.png', fullPage: true });
  console.log('Screenshot: step6-after-transfer.png');

  // ========== STEP 7: Verify 45K balance ==========
  console.log('\n=== STEP 7: Verify 45K Balance ===');
  const afterText = await page.locator('body').textContent();
  fs.writeFileSync('exploration/step7-body-text.txt', afterText);
  const has45k = /45[,\s]?000|45K/i.test(afterText);
  console.log('Has 45K balance:', has45k);

  // ========== STEP 8: Sign Out ==========
  console.log('\n=== STEP 8: Sign Out ===');
  const signoutBtn = page.locator('button, a').filter({ hasText: /sign.out|logout|log.out/i }).first();
  if (await signoutBtn.isVisible().catch(() => false)) {
    await signoutBtn.click();
    console.log('Signed out successfully');
  } else {
    console.log('No signout button found');
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'exploration/step8-after-signout.png', fullPage: true });
  console.log('Screenshot: step8-after-signout.png');

  await browser.close();
  console.log('\nFull flow exploration complete!');
})();
