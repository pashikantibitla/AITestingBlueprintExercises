const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to TTA Bank
  console.log('Navigating to TTA Bank...');
  await page.goto('https://tta-bank-digital-973242068062.us-west1.run.app/');
  await page.waitForLoadState('networkidle');

  // Take initial screenshot
  await page.screenshot({ path: 'exploration/01-landing-page.png', fullPage: true });
  console.log('Screenshot saved: 01-landing-page.png');

  // Save page HTML
  const html = await page.content();
  fs.writeFileSync('exploration/01-landing-page.html', html);
  console.log('HTML saved: 01-landing-page.html');

  // Get page title and URL
  console.log('\nPage Title:', await page.title());
  console.log('Page URL:', page.url());

  // List all buttons
  const buttons = await page.locator('button').all();
  console.log('\n--- Buttons ---');
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent().catch(() => '');
    const type = await buttons[i].getAttribute('type').catch(() => '');
    const id = await buttons[i].getAttribute('id').catch(() => '');
    console.log(`[${i}] text="${text?.trim()}" type="${type}" id="${id}"`);
  }

  // List all links
  const links = await page.locator('a').all();
  console.log('\n--- Links ---');
  for (let i = 0; i < Math.min(links.length, 30); i++) {
    const text = await links[i].textContent().catch(() => '');
    const href = await links[i].getAttribute('href').catch(() => '');
    console.log(`[${i}] text="${text?.trim()}" href="${href}"`);
  }

  // List all inputs
  const inputs = await page.locator('input').all();
  console.log('\n--- Inputs ---');
  for (let i = 0; i < inputs.length; i++) {
    const type = await inputs[i].getAttribute('type').catch(() => '');
    const name = await inputs[i].getAttribute('name').catch(() => '');
    const placeholder = await inputs[i].getAttribute('placeholder').catch(() => '');
    const id = await inputs[i].getAttribute('id').catch(() => '');
    console.log(`[${i}] type="${type}" name="${name}" id="${id}" placeholder="${placeholder}"`);
  }

  // Save a text-based snapshot of visible text
  const bodyText = await page.locator('body').textContent();
  fs.writeFileSync('exploration/01-body-text.txt', bodyText);
  console.log('\nBody text saved: 01-body-text.txt');

  // Try to find and click signup/register
  const signupKeywords = ['sign up', 'signup', 'register', 'create account', 'get started', 'open account'];
  let foundSignup = false;
  for (const keyword of signupKeywords) {
    const btn = page.locator('button, a').filter({ hasText: new RegExp(keyword, 'i') }).first();
    if (await btn.isVisible().catch(() => false)) {
      console.log(`\n>>> Found signup link/button: "${keyword}"`);
      await btn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'exploration/02-signup-page.png', fullPage: true });
      console.log('Screenshot saved: 02-signup-page.png');

      const signupHtml = await page.content();
      fs.writeFileSync('exploration/02-signup-page.html', signupHtml);

      const signupInputs = await page.locator('input').all();
      console.log('\n--- Signup Page Inputs ---');
      for (let i = 0; i < signupInputs.length; i++) {
        const type = await signupInputs[i].getAttribute('type').catch(() => '');
        const name = await signupInputs[i].getAttribute('name').catch(() => '');
        const placeholder = await signupInputs[i].getAttribute('placeholder').catch(() => '');
        const id = await signupInputs[i].getAttribute('id').catch(() => '');
        console.log(`[${i}] type="${type}" name="${name}" id="${id}" placeholder="${placeholder}"`);
      }
      foundSignup = true;
      break;
    }
  }

  if (!foundSignup) {
    console.log('\n>>> No signup button found with common keywords');
  }

  await browser.close();
  console.log('\nExploration complete. Check exploration/ folder.');
})();
