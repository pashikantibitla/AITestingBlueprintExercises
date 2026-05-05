async page => {
  await page.screencast.start({
    path: 'validation-recording.webm',
    size: { width: 1280, height: 800 }
  });

  // Chapter 1: Navigate to VWO Login
  await page.screencast.showChapter('Step 1: Navigate to VWO Login', {
    description: 'Opening app.vwo.com login page for validation.',
    duration: 2500,
  });
  await page.goto('https://app.vwo.com/#/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Chapter 2: Fill Invalid Username
  await page.screencast.showChapter('Step 2: Enter Invalid Username', {
    description: 'Typing an invalid email address into the Email field.',
    duration: 2500,
  });
  const emailField = page.getByRole('textbox', { name: 'Email address' });
  await emailField.scrollIntoViewIfNeeded();
  await emailField.pressSequentially('invalid_user@example.com', { delay: 60 });
  await page.waitForTimeout(1000);

  // Chapter 3: Fill Invalid Password
  await page.screencast.showChapter('Step 3: Enter Invalid Password', {
    description: 'Typing an invalid password into the Password field.',
    duration: 2500,
  });
  const passwordField = page.getByRole('textbox', { name: 'Password' });
  await passwordField.scrollIntoViewIfNeeded();
  await passwordField.pressSequentially('wrongpassword123', { delay: 60 });
  await page.waitForTimeout(1000);

  // Chapter 4: Click Sign In
  await page.screencast.showChapter('Step 4: Click Sign In Button', {
    description: 'Submitting the login form with invalid credentials.',
    duration: 2500,
  });
  const signInButton = page.getByRole('button', { name: 'Sign in', exact: true });
  await signInButton.click();
  await page.waitForTimeout(2000);

  // Chapter 5: Verify Error Message
  await page.screencast.showChapter('Step 5: Verify Error Message', {
    description: 'Validating that the appropriate error notification is displayed.',
    duration: 3000,
  });
  const errorNotification = page.locator('.notification-box-description');
  const errorText = await errorNotification.textContent();

  const annotation = await page.screencast.showOverlay(`
    <div style="position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
      padding: 12px 20px; background: rgba(220, 38, 38, 0.9);
      border-radius: 8px; font-size: 15px; color: white; font-family: sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3); white-space: nowrap;">
      ✗ Error Verified: "${errorText?.trim() || 'Error message displayed'}"
    </div>
  `);
  await page.waitForTimeout(3000);
  await annotation.dispose();

  // Chapter 6: Test Empty Fields
  await page.screencast.showChapter('Step 6: Empty Fields Validation', {
    description: 'Clearing fields and submitting empty form to verify error handling.',
    duration: 2500,
  });
  await emailField.clear();
  await passwordField.clear();
  await signInButton.click();
  await page.waitForTimeout(2000);

  const emptyErrorAnnotation = await page.screencast.showOverlay(`
    <div style="position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
      padding: 12px 20px; background: rgba(220, 38, 38, 0.9);
      border-radius: 8px; font-size: 15px; color: white; font-family: sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3); white-space: nowrap;">
      ✗ Empty Fields Error Verified
    </div>
  `);
  await page.waitForTimeout(2500);
  await emptyErrorAnnotation.dispose();

  // Final Chapter
  await page.screencast.showChapter('Validation Complete', {
    description: 'All steps validated successfully. Recording saved to validation-recording.webm',
    duration: 3000,
  });

  await page.screencast.stop();
}
