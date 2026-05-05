# Step-by-Step Test Validation Report
## Exercise 01: VWO Login Flow (Invalid Credentials)

**Date:** 2026-05-05  
**Framework:** Playwright CLI + @playwright/test  
**Skill Used:** `.github/playwright-cli/SKILL.md`

---

## Test Execution Summary

| Test Case | Scenario | Status | Duration |
|-----------|----------|--------|----------|
| TC-01 | Invalid username & password | ✅ PASSED | ~21s |
| TC-02 | Empty username & password | ✅ PASSED | ~10s |

**Total Execution Time:** ~36s  
**Browser:** Chromium (headless)  
**Config:** `playwright.validation.config.js` (trace=on, video=on, screenshot=on)

---

## Step-by-Step Validation (TC-01: Invalid Credentials)

### Step 1: Navigate to VWO Login Page
- **Action:** `page.goto('https://app.vwo.com/#/login')`
- **Validation:** Page loaded successfully, login form visible
- **Artifact:** trace.zip (frame 0), video.webm (00:00)

### Step 2: Enter Invalid Email
- **Action:** `page.getByRole('textbox', { name: 'Email address' }).fill('invalid_user@example.com')`
- **Validation:** Text entered correctly into email field
- **Artifact:** trace.zip (frame 1), video.webm (00:03)

### Step 3: Enter Invalid Password
- **Action:** `page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword123')`
- **Validation:** Text entered correctly into password field
- **Artifact:** trace.zip (frame 2), video.webm (00:05)

### Step 4: Click Sign In Button
- **Action:** `page.getByRole('button', { name: 'Sign in', exact: true }).click()`
- **Validation:** Button clicked, form submitted
- **Artifact:** trace.zip (frame 3), video.webm (00:07)

### Step 5: Verify Error Message
- **Action:** `expect(page.locator('.notification-box-description')).toBeVisible()`
- **Validation:** ✅ Error notification appeared containing:  
  `"Your email, password, IP address or location did not match"`
- **Artifact:** trace.zip (frame 4), video.webm (00:09), test-finished-1.png

---

## Step-by-Step Validation (TC-02: Empty Fields)

### Step 1: Navigate to VWO Login Page
- **Action:** `page.goto('https://app.vwo.com/#/login')`
- **Validation:** Page loaded, form ready

### Step 2: Leave Fields Empty & Submit
- **Action:** Click Sign In without filling any fields
- **Validation:** ✅ Error notification displayed for empty submission
- **Artifact:** trace.zip, video.webm, test-finished-1.png

---

## Generated Artifacts Location

```
practice_06_playWright_CLI_Integration/
└── exercise_01_login_VWO/
    └── test-results/
        ├── vwo-login-invalid-...-valid-username-and-password-chromium-validation/
        │   ├── trace.zip          ← Step-by-step DOM + network + console
        │   ├── video.webm         ← Full screen recording
        │   └── test-finished-1.png ← Final screenshot
        └── vwo-login-invalid-...-empty-username-and-password-chromium-validation/
            ├── trace.zip
            ├── video.webm
            └── test-finished-1.png
```

---

## How to Replay / Inspect Recordings

### View Trace (Interactive)
```bash
cd exercise_01_login_VWO
npx playwright show-trace "test-results/<folder>/trace.zip"
```

### Play Video
```bash
# Open video.webm in any video player or browser
start "test-results/<folder>/video.webm"
```

### View Screenshot
```bash
start "test-results/<folder>/test-finished-1.png"
```

---

## CLI Commands Used for Validation

```bash
# Install dependencies
npm install @playwright/test
npx playwright install chromium

# Codegen (record login flow)
npx playwright codegen --target javascript --output generated_login_test.spec.js https://app.vwo.com/#/login

# Run validation with full recording
npx playwright test --config=playwright.validation.config.js

# View report
npx playwright show-report
```

---

*Report generated automatically by Playwright CLI validation workflow.*
