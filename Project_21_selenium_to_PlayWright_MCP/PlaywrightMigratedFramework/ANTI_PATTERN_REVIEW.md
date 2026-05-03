# Anti-Pattern Review: Migrated Playwright Code

**Review Date:** 2026-05-03  
**Files Reviewed:**
- `src/pages/vwo/VWOLoginPage.ts`
- `src/modules/vwo/VWOLoginModule.ts`
- `src/tests/vwo/vwo-login-pf.spec.ts`
- `src/pages/vwo/index.ts`, `src/pages/index.ts`
- `src/modules/vwo/index.ts`, `src/modules/index.ts`

---

## Summary

| Check | Status | Count |
|-------|--------|-------|
| 1. Page stored in Module constructor | ✅ PASS | 0 issues |
| 2. Page passed to API client | ✅ PASS | 0 issues |
| 3. XPath or class-based selectors | ⚠️ WARN | 3 locators use ID/attribute instead of getByTestId |
| 4. Hardcoded URLs or credentials | 🔴 FAIL | 5 hardcoded fallback values |
| 5. `any` type usage | ✅ PASS | 0 issues |
| 6. Missing async/await | ⚠️ WARN | 1 sync assertion on dynamic value |
| 7. Unnecessary waits | ⚠️ WARN | 1 waitFor that could be expect().toBeVisible() |
| 8. More than 50 locators | ✅ PASS | 4 locators (well under limit) |
| 9. Missing barrel exports | ✅ PASS | All present |
| 10. Base class wrappers | ✅ PASS | No base class |

**Overall: 3 FAIL/WARN categories require fixes**

---

## 🔴 Issue #1: HARDCODED Credentials & URLs (Anti-Pattern #4)

**Severity:** CRITICAL  
**Rule:** NO hardcoded URLs or credentials — use environment variables

### Problem
The test file uses `??` nullish coalescing with **hardcoded fallback credentials**. If `.env` is missing or env vars are undefined, the tests run with real credentials embedded in source code.

### Evidence
```typescript
// src/tests/vwo/vwo-login-pf.spec.ts
await loginModule.loginWithValidCredentials(
  page,
  process.env.VWO_USERNAME ?? 'hebiva4776@amcret.com',  // 🔴 HARDCODED
  process.env.VWO_PASSWORD ?? 'Test@4321',               // 🔴 HARDCODED
);

await loginModule.loginWithInvalidCredentials(
  page,
  process.env.VWO_INVALID_USERNAME ?? 'admin@admin.com', // 🔴 HARDCODED
  process.env.VWO_INVALID_PASSWORD ?? 'Test@2024',       // 🔴 HARDCODED
);

expect(errorMessage).toBe(
  process.env.VWO_EXPECTED_ERROR_MESSAGE ??
    'Your email, password, IP address or location did not match', // 🔴 HARDCODED
);
```

### Why This Is Dangerous
1. **Security risk:** Real credentials committed to git history
2. **Environment fragility:** Tests pass silently with wrong credentials if `.env` is missing
3. **No fail-fast:** Silent fallback masks configuration issues

### Fix
**Remove ALL fallback values.** Throw explicit errors if env vars are missing:

```typescript
// src/tests/vwo/vwo-login-pf.spec.ts
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

test.describe('@P1 @Regression @VWO @Login', () => {
  const username = requireEnv('VWO_USERNAME');
  const password = requireEnv('VWO_PASSWORD');
  const invalidUsername = requireEnv('VWO_INVALID_USERNAME');
  const invalidPassword = requireEnv('VWO_INVALID_PASSWORD');
  const expectedError = requireEnv('VWO_EXPECTED_ERROR_MESSAGE');

  test('testPass - Should pass successfully', async ({ page }) => {
    const loginModule = new VWOLoginModule();
    await loginModule.loginWithValidCredentials(page, username, password);
    await expect(page).toHaveURL(/app\.vwo\.com/);
  });

  test('should display error for invalid credentials', async ({ page }) => {
    const loginModule = new VWOLoginModule();
    const errorMessage = await loginModule.loginWithInvalidCredentials(
      page, invalidUsername, invalidPassword
    );
    expect(errorMessage).toBe(expectedError);
  });
});
```

---

## ⚠️ Issue #2: Non-Semantic Locators (Anti-Pattern #3)

**Severity:** MEDIUM  
**Rule:** Use `getByTestId` or `getByRole` (NOT XPath, NOT CSS class)

### Problem
3 of 4 locators use ID/attribute selectors instead of semantic `getByTestId` or `getByRole`:

```typescript
// src/pages/vwo/VWOLoginPage.ts
usernameInput = (): Locator => this.page.locator('#login-username');           // ⚠️ ID-based
passwordInput = (): Locator => this.page.locator('input[name="password"]');   // ⚠️ attribute-based
errorMessage = (): Locator => this.page.locator('#js-notification-box-msg');    // ⚠️ ID-based
signInButton = (): Locator => this.page.getByRole('button', { name: 'Sign in', exact: true }); // ✅ correct
```

### Why This Is a Problem
- IDs can change during application refactoring
- `name` attributes are not guaranteed stable
- `getByTestId` is the most resilient locator strategy

### Fix
**Short-term:** Use `getByLabel` or `getByPlaceholder` if the DOM supports it:
```typescript
usernameInput = (): Locator => this.page.getByLabel('Email address');
passwordInput = (): Locator => this.page.getByLabel('Password');
errorMessage = (): Locator => this.page.getByRole('alert');
```

**Long-term:** Add `data-testid` attributes to the VWO application HTML:
```html
<input id="login-username" data-testid="login-username-input" ... />
<input name="password" data-testid="login-password-input" ... />
<div id="js-notification-box-msg" data-testid="login-error-message" ... />
```

Then migrate locators:
```typescript
usernameInput = (): Locator => this.page.getByTestId('login-username-input');
passwordInput = (): Locator => this.page.getByTestId('login-password-input');
errorMessage = (): Locator => this.page.getByTestId('login-error-message');
```

---

## ⚠️ Issue #3: Synchronous Assertion on Dynamic URL (Anti-Pattern #6)

**Severity:** MEDIUM  
**Rule:** Use `expect()` for assertions (web-first for dynamic values)

### Problem
```typescript
// src/tests/vwo/vwo-login-pf.spec.ts (line 26)
expect(page.url()).toContain('app.vwo.com');
```

`page.url()` is synchronous, but the URL may not have stabilized yet after `clickSignIn()`. This can cause flaky tests.

### Fix
Use Playwright's **auto-retrying web-first assertion**:
```typescript
await expect(page).toHaveURL(/app\.vwo\.com/);
```

This polls the URL until the condition is met or timeout expires.

---

## ⚠️ Issue #4: waitFor Instead of Web-First Assertion (Anti-Pattern #7)

**Severity:** LOW  
**Rule:** NO unnecessary waits — rely on auto-wait

### Problem
```typescript
// src/pages/vwo/VWOLoginPage.ts (lines 105-108)
async getErrorMessage(): Promise<string> {
  await this.errorMessage().waitFor({ state: 'visible', timeout: 10000 });
  return (await this.errorMessage().textContent()) ?? '';
}
```

The `waitFor` is functionally correct but less idiomatic than a web-first assertion.

### Fix
Replace with an inline assertion that doubles as a wait:
```typescript
async getErrorMessage(): Promise<string> {
  await expect(this.errorMessage()).toBeVisible();
  return (await this.errorMessage().textContent()) ?? '';
}
```

Or even better, return the locator and let the test use web-first assertion directly:
```typescript
// Page object
errorMessageLocator = (): Locator => this.errorMessage();

// Test
await expect(loginPage.errorMessageLocator()).toHaveText(expectedError);
```

---

## ✅ PASS: Check #1 — Page Stored in Module Constructor

**Status:** PASS ✅  
**Evidence:**
```typescript
// src/modules/vwo/VWOLoginModule.ts
export class VWOLoginModule {
  async loginWithInvalidCredentials(
    page: Page,        // ✅ Page is METHOD parameter
    username: string,
    password: string,
  ): Promise<string> { ... }
}
```

No constructor stores Page. Page is passed to every method call.

---

## ✅ PASS: Check #2 — Page Passed to API Client

**Status:** PASS ✅  
**Evidence:** No API client exists in this codebase. If one were added, it must accept `APIRequestContext` instead of `Page`.

---

## ✅ PASS: Check #5 — `any` Type Usage

**Status:** PASS ✅  
**Evidence:** No `any` types found. All functions have explicit return types:
- `async navigate(): Promise<void>`
- `async enterUsername(username: string): Promise<void>`
- `async getErrorMessage(): Promise<string>`

---

## ✅ PASS: Check #8 — More Than 50 Locators

**Status:** PASS ✅  
**Evidence:** Only 4 locators in `VWOLoginPage`:
1. `usernameInput`
2. `passwordInput`
3. `signInButton`
4. `errorMessage`

Well under the 50-locator limit.

---

## ✅ PASS: Check #9 — Missing Barrel Exports

**Status:** PASS ✅  
**Evidence:** All barrel files present:
- `src/pages/vwo/index.ts` ✅
- `src/pages/index.ts` ✅
- `src/modules/vwo/index.ts` ✅
- `src/modules/index.ts` ✅

---

## ✅ PASS: Check #10 — Base Class Wrappers

**Status:** PASS ✅  
**Evidence:** `VWOLoginPage` does NOT extend any base class. No `CommonToAllPage` equivalent exists. All methods use Playwright's native Locator API directly:
- `this.usernameInput().fill(username)` ✅ (NOT `enterInput(usernameElement, username)`)
- `this.signInButton().click()` ✅ (NOT `clickElement(signButton)`)

---

## 🔧 Recommended Refactored Files

### `src/tests/vwo/vwo-login-pf.spec.ts` (Fixed)
```typescript
import { test, expect } from '@playwright/test';
import { VWOLoginModule } from '@modules/vwo';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

test.describe('@P1 @Regression @VWO @Login', () => {
  const creds = {
    username: requireEnv('VWO_USERNAME'),
    password: requireEnv('VWO_PASSWORD'),
    invalidUsername: requireEnv('VWO_INVALID_USERNAME'),
    invalidPassword: requireEnv('VWO_INVALID_PASSWORD'),
    expectedError: requireEnv('VWO_EXPECTED_ERROR_MESSAGE'),
  };

  test('testPass - Should pass successfully', async ({ page }) => {
    const loginModule = new VWOLoginModule();
    await loginModule.loginWithValidCredentials(page, creds.username, creds.password);
    await expect(page).toHaveURL(/app\.vwo\.com/);  // ✅ Web-first assertion
  });

  test('testFail - Should trigger intentional failure', async () => {
    expect(true).toBe(false);
  });

  test('should display error for invalid credentials', async ({ page }) => {
    const loginModule = new VWOLoginModule();
    const errorMessage = await loginModule.loginWithInvalidCredentials(
      page, creds.invalidUsername, creds.invalidPassword
    );
    expect(errorMessage).toBe(creds.expectedError);
  });
});
```

### `src/pages/vwo/VWOLoginPage.ts` (Fixed)
```typescript
import { Page, Locator, expect } from '@playwright/test';

export class VWOLoginPage {
  constructor(private readonly page: Page) {}

  // LOCATORS — TODO: Migrate to getByTestId after adding data-testid to VWO app
  usernameInput = (): Locator => this.page.locator('#login-username');
  passwordInput = (): Locator => this.page.locator('input[name="password"]');
  signInButton = (): Locator => this.page.getByRole('button', { name: 'Sign in', exact: true });
  errorMessage = (): Locator => this.page.locator('#js-notification-box-msg');

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput().fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput().fill(password);
  }

  async clickSignIn(): Promise<void> {
    await this.signInButton().click();
  }

  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage()).toBeVisible();  // ✅ Web-first assertion replaces waitFor
    return (await this.errorMessage().textContent()) ?? '';
  }
}
```

---

## Action Items

| # | Priority | Action | File |
|---|----------|--------|------|
| 1 | 🔴 CRITICAL | Remove all hardcoded fallback credentials | `vwo-login-pf.spec.ts` |
| 2 | 🔴 CRITICAL | Add `requireEnv()` helper for fail-fast env validation | `vwo-login-pf.spec.ts` |
| 3 | 🟡 MEDIUM | Replace `page.url()` sync assertion with `expect(page).toHaveURL()` | `vwo-login-pf.spec.ts` |
| 4 | 🟡 MEDIUM | Plan `data-testid` attribute additions to VWO app | VWO application |
| 5 | 🟢 LOW | Replace `waitFor` with `expect().toBeVisible()` | `VWOLoginPage.ts` |
| 6 | 🟢 LOW | Remove RCA comments (keep in bug reports, not source) | All files |
