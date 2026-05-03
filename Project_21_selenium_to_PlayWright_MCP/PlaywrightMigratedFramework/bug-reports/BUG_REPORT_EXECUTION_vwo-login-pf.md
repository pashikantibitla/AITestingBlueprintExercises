# Bug Report: Execution Analysis — `vwo-login-pf.spec.ts`

| Field | Value |
|-------|-------|
| **Test File** | `src/tests/vwo/vwo-login-pf.spec.ts` |
| **Test Case** | `should display error message for invalid credentials` |
| **Tags** | `@P1 @Regression @VWO @Login` |
| **Browser** | Chromium (Desktop Chrome) |
| **Execution Date** | 2026-05-03 |
| **Framework** | PlaywrightMigratedFramework |

---

## Execution Summary

| Run | Status | Duration | Error | Fix Applied |
|-----|--------|----------|-------|-------------|
| **#1** | ❌ FAILED | 16.4s | `strict mode violation: getByRole('button', { name: /sign in/i }) resolved to 4 elements` | Changed to `exact: true` |
| **#2** | ❌ FAILED | 13.9s | `Expected: "Your email..." | Received: ""` | Added `waitFor({ state: 'visible' })` |
| **#3** | ✅ PASSED | 14.6s | — | All fixes verified |

**Final Status: ✅ PASSED (29.1s total execution time)**

---

## Artifacts Generated

| Artifact | File | Size | Description |
|----------|------|------|-------------|
| **Trace** | `bug-reports/execution-trace-passed.zip` | 2.6 MB | Full Playwright Trace Viewer — DOM snapshots, network logs, console output, click-by-click replay |
| **Screenshot** | `test-results/.../test-failed-1.png` (Run #1, #2) | ~100 KB | Screenshot captured on failure via `screenshot: 'only-on-failure'` |
| **Video** | `test-results/.../video.webm` (Run #1, #2) | ~500 KB | Video recording of full test execution via `video: 'retain-on-failure'` |
| **HTML Report** | `playwright-report/index.html` | — | Built-in Playwright HTML reporter with trace viewer integration |
| **Last Run** | `test-results/.last-run.json` | 45 bytes | JSON status: `{ "status": "passed", "failedTests": [] }` |

### View Trace
```bash
cd PlaywrightMigratedFramework
npx playwright show-trace bug-reports/execution-trace-passed.zip
```

The trace viewer provides:
- **Action Scrubber:** Scrub through every click, fill, and navigation
- **DOM Snapshot:** Exact HTML/CSS at any point in execution
- **Network Tab:** All HTTP requests/responses
- **Console Tab:** Browser console logs (errors, warnings)
- **Source Tab:** Test source mapped to execution timeline

---

## Execution Run #1: ❌ FAILED (16.4s)

### Error
```
Error: strict mode violation: getByRole('button', { name: /sign in/i }) resolved to 4 elements:
    1) <button type="submit" id="js-login-btn" ...>Sign in</button>
    2) <button type="button" ...>Sign in with Google</button>
    3) <button type="button" ...>Sign in using SSO</button>
    4) <button type="button" ...>Sign in with Passkey</button>
```

### Root Cause Analysis (RCA)
| Item | Detail |
|------|--------|
| **Symptom** | Button click fails because locator matches 4 elements |
| **Root Cause** | `getByRole('button', { name: /sign in/i })` uses a **regex** (`/sign in/i`) that matches any button containing "sign in" — including "Sign in with Google", "Sign in using SSO", and "Sign in with Passkey" |
| **Why It Happened** | The VWO login page has multiple sign-in options (form, Google, SSO, Passkey). The regex `/sign in/i` is too broad. |
| **Selenium Equivalent** | Selenium's `By.id("js-login-btn")` was unambiguous because IDs are unique. The migration to `getByRole` lost this precision. |
| **Fix Applied** | Changed to `getByRole('button', { name: 'Sign in', exact: true })` — matches **only** the exact text "Sign in", excluding variants. |
| **File Changed** | `src/pages/vwo/VWOLoginPage.ts` line 23 |

### Steps Executed Before Failure
| Step | Action | Status |
|------|--------|--------|
| 1 | `page.goto('/')` → navigate to VWO | ✅ Passed |
| 2 | `usernameInput().fill('admin@admin.com')` | ✅ Passed |
| 3 | `passwordInput().fill('Test@2024')` | ✅ Passed |
| 4 | `signInButton().click()` | ❌ **FAILED** — strict mode violation |
| 5 | `getErrorMessage()` | Not reached |
| 6 | `expect(errorMessage).toBe(...)` | Not reached |

### Artifacts from Run #1
- ✅ Screenshot: `test-failed-1.png` — shows VWO login page with 4 buttons visible
- ✅ Video: `video.webm` — full execution up to button click failure
- ✅ Trace: `trace.zip` — DOM snapshot at failure point showing 4 matched buttons

---

## Execution Run #2: ❌ FAILED (13.9s)

### Error
```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "Your email, password, IP address or location did not match"
Received: ""
```

### Root Cause Analysis (RCA)
| Item | Detail |
|------|--------|
| **Symptom** | Error message element exists but `textContent()` returns empty string `""` |
| **Root Cause** | **Race condition.** The error message `<div id="js-notification-box-msg">` exists in DOM immediately, but its text content is populated asynchronously after the server validates credentials. `textContent()` reads the DOM instantly without waiting for content to appear. |
| **Why It Happened** | The original Selenium code had `WaitHelpers.waitJVM(5000)` — a hard 5-second sleep — which accidentally masked this timing issue. When we removed the sleep (correctly following Playwright rules), the timing issue was exposed. |
| **Selenium Behavior** | `Thread.sleep(5000)` → `getText(error_message)` — always worked because 5 seconds was enough for the server response |
| **Fix Applied** | Added `await this.errorMessage().waitFor({ state: 'visible', timeout: 10000 })` before `textContent()`. Playwright polls efficiently and returns as soon as the element becomes visible with content. |
| **File Changed** | `src/pages/vwo/VWOLoginPage.ts` lines 101–106 |

### Steps Executed Before Failure
| Step | Action | Status |
|------|--------|--------|
| 1 | `page.goto('/')` → navigate to VWO | ✅ Passed |
| 2 | `usernameInput().fill('admin@admin.com')` | ✅ Passed |
| 3 | `passwordInput().fill('Test@2024')` | ✅ Passed |
| 4 | `signInButton().click()` | ✅ Passed (fixed from Run #1) |
| 5 | `getErrorMessage()` → `textContent()` | ❌ **FAILED** — returns `""` because text hasn't appeared yet |
| 6 | `expect(errorMessage).toBe(...)` | ❌ **FAILED** — assertion mismatch |

### Artifacts from Run #2
- ✅ Screenshot: `test-failed-1.png` — shows empty error message div
- ✅ Video: `video.webm` — shows form submission but no error text visible yet
- ✅ Trace: `trace.zip` — DOM snapshot shows `#js-notification-box-msg` exists but is empty

---

## Execution Run #3: ✅ PASSED (14.6s)

### Success Confirmation
```
Running 1 test using 1 worker
  ok 1 [chromium] › ... › should display error message for invalid credentials (14.6s)
  1 passed (29.1s)
```

### Steps Executed (All Passed)
| Step | Action | Duration | Status |
|------|--------|----------|--------|
| 1 | `page.goto('/')` → navigate to `https://app.vwo.com` | ~2s | ✅ Passed |
| 2 | `page.locator('#login-username').fill('admin@admin.com')` | ~500ms | ✅ Passed |
| 3 | `page.locator('input[name="password"]').fill('Test@2024')` | ~500ms | ✅ Passed |
| 4 | `page.getByRole('button', { name: 'Sign in', exact: true }).click()` | ~1s | ✅ Passed |
| 5 | `page.locator('#js-notification-box-msg').waitFor({ state: 'visible' })` | ~2s | ✅ Passed — polled until visible |
| 6 | `page.locator('#js-notification-box-msg').textContent()` | ~100ms | ✅ Passed — returned `"Your email, password, IP address or location did not match"` |
| 7 | `expect(errorMessage).toBe("Your email, password, IP address or location did not match")` | — | ✅ **PASSED** |

### Artifacts from Run #3
- ✅ Trace: `bug-reports/execution-trace-passed.zip` (2.6 MB) — full passing execution trace
- ❌ No screenshot (test passed — `screenshot: 'only-on-failure'`)
- ❌ No video (test passed — `video: 'retain-on-failure'`)
- ✅ HTML Report: `playwright-report/index.html`

---

## Cross-Run Comparison

| Dimension | Run #1 (Failed) | Run #2 (Failed) | Run #3 (Passed) |
|-----------|-----------------|-----------------|-----------------|
| **Error Type** | Locator ambiguity | Timing/race condition | — |
| **Failed Step** | `clickSignIn()` | `getErrorMessage()` | None |
| **Screenshot** | ✅ Captured | ✅ Captured | ❌ Not captured (pass) |
| **Video** | ✅ Captured | ✅ Captured | ❌ Not captured (pass) |
| **Trace** | ✅ Captured | ✅ Captured | ✅ Captured |
| **Fix Complexity** | 1 line (exact: true) | 1 line (waitFor) | — |

---

## Fixes Applied (Chronological)

### Fix #1: TypeScript Infrastructure
```diff
+ Created tsconfig.json      → Path aliases (@pages/*, @modules/*)
+ Created package.json       → Dependencies (@playwright/test, typescript, dotenv, @types/node)
+ Created playwright.config.ts → baseURL, trace, screenshot, video config
+ Created .env               → Environment variables
+ Added "types": ["node"]    → Resolves process.env types
```

### Fix #2: Locator Precision (Run #1 → Run #2)
```diff
- signInButton = (): Locator => this.page.getByRole('button', { name: /sign in/i });
+ signInButton = (): Locator => this.page.getByRole('button', { name: 'Sign in', exact: true });
```

### Fix #3: Timing / Auto-Wait (Run #2 → Run #3)
```diff
  async getErrorMessage(): Promise<string> {
+   await this.errorMessage().waitFor({ state: 'visible', timeout: 10000 });
    return (await this.errorMessage().textContent()) ?? '';
  }
```

---

## Key Learnings from Execution

1. **Regex locators are dangerous:** `/sign in/i` matched 4 buttons. Always use `exact: true` when possible.
2. **Removing `Thread.sleep` exposes real timing issues:** The original Selenium's 5-second sleep masked an async DOM update. Playwright's `waitFor()` is the correct replacement.
3. **Trace Viewer is invaluable:** The `trace.zip` file showed exactly which 4 buttons matched and why the error div was empty.
4. **Failure artifacts accelerate debugging:** Screenshots and video from failed runs made RCA trivial.
5. **Infrastructure must exist before source code:** Missing `tsconfig.json` and `package.json` caused the initial "libraries not defined" error.

---

## Verification Commands

```bash
# Run the test
cd PlaywrightMigratedFramework
npx playwright test src/tests/vwo/vwo-login-pf.spec.ts --project=chromium

# View the trace
npx playwright show-trace bug-reports/execution-trace-passed.zip

# Show HTML report
npx playwright show-report

# Run with UI mode for debugging
npx playwright test --ui
```

---

## File Structure (Post-Fix)

```
PlaywrightMigratedFramework/
├── .env
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── bug-reports/
│   ├── BUG_REPORT_EXECUTION_vwo-login-pf.md      ← This report
│   └── execution-trace-passed.zip                ← 2.6 MB trace
├── playwright-report/
│   └── index.html                                ← HTML report with trace viewer
├── src/
│   ├── modules/vwo/VWOLoginModule.ts
│   ├── pages/vwo/VWOLoginPage.ts
│   └── tests/vwo/vwo-login-pf.spec.ts
└── test-results/
    └── vwo-vwo-login-pf-...-chromium/
        └── trace.zip                             ← Latest trace
```

---

*Report generated: 2026-05-03*  
*Test: `vwo-login-pf.spec.ts`*  
*Total executions: 3 (2 failed, 1 passed)*  
*Final status: ✅ PASSED*
