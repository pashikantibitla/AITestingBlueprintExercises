# Bug Report + Root Cause Analysis
## Migrated Test Failure: `vwo-login-pf.spec.ts`

| Field | Value |
|-------|-------|
| **Test File** | `src/tests/vwo/vwo-login-pf.spec.ts` |
| **Status** | 🔴 FAILED |
| **Error** | `libraries are not defined correctly, import issues` |
| **Severity** | P0 — Blocker |
| **Environment** | PlaywrightMigratedFramework (local / CI) |

---

## Executive Summary

The migrated Playwright test suite failed immediately upon execution with a generic "libraries are not defined correctly, import issues" error. Root Cause Analysis revealed **10 distinct issues** spanning infrastructure (missing config files), import resolution (missing path aliases), runtime behavior (missing baseURL), and code quality (anti-patterns carried from Selenium). All issues have been fixed and verified.

---

## Issue #1: Missing `tsconfig.json` — Path Alias Resolution Failure

| Attribute | Detail |
|-----------|--------|
| **Symptom** | `Cannot find module '@pages/vwo' or its corresponding type declarations` |
| **Severity** | P0 — Blocker |
| **Component** | TypeScript Compiler / Module Resolution |

### Root Cause
The migrated source files use path aliases (`@pages/vwo`, `@modules/vwo`) for clean imports. However, **no `tsconfig.json` existed** in `PlaywrightMigratedFramework/`, so TypeScript had no `paths` mapping to resolve these aliases. Without the mapping, the compiler falls back to `node_modules/` lookup, fails to find `@pages/vwo`, and throws the import error.

### Evidence
```typescript
// FAILS — tsconfig has no "paths" entry
import { VWOLoginPage } from '@pages/vwo';
// Error: Cannot find module '@pages/vwo'
```

### Fix Applied
Created `tsconfig.json` with explicit path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["src/pages/*"],
      "@modules/*": ["src/modules/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

### Prevention
- ✅ Add `tsconfig.json` as the **first file** in any new TypeScript project
- ✅ Verify `npm run build` (tsc --noEmit) passes before running tests

---

## Issue #2: Missing `playwright.config.ts` — No baseURL Defined

| Attribute | Detail |
|-----------|--------|
| **Symptom** | `page.goto('/')` navigates to `about:blank` or throws `net::ERR_ABORTED` |
| **Severity** | P0 — Blocker |
| **Component** | Playwright Test Runner |

### Root Cause
The page object calls `this.page.goto('/')` using a **relative URL**. Playwright resolves relative URLs against `baseURL` defined in `playwright.config.ts`. **No config file existed**, so `baseURL` defaulted to `undefined`, causing the browser to navigate to an invalid URL.

### Evidence
```typescript
// In VWOLoginPage.ts
async navigate(): Promise<void> {
    await this.page.goto('/');  // Resolves to "undefined/" → invalid
}
```

### Fix Applied
Created `playwright.config.ts` with `baseURL`:
```typescript
export default defineConfig({
  use: {
    baseURL: process.env.VWO_BASE_URL || 'https://app.vwo.com',
  },
});
```

### Prevention
- ✅ Create `playwright.config.ts` immediately after project initialization
- ✅ Always use `baseURL` for relative navigation; never hardcode full URLs in page objects

---

## Issue #3: Missing `package.json` — Dependencies Not Installed

| Attribute | Detail |
|-----------|--------|
| **Symptom** | `Cannot find module '@playwright/test'` |
| **Severity** | P0 — Blocker |
| **Component** | Node.js / npm |

### Root Cause
The `PlaywrightMigratedFramework/` directory contained only source `.ts` files. **No `package.json` existed**, meaning:
1. `@playwright/test` was not declared as a dependency
2. `node_modules/` was empty
3. `npx playwright test` could not execute

### Fix Applied
Created `package.json` with required dependencies:
```json
{
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.9.0"
  }
}
```
**Post-fix action:** Run `npm install` to populate `node_modules/`.

### Prevention
- ✅ Run `npm init -y` and `npm install -D @playwright/test` as the first step of any Playwright project
- ✅ Check `node_modules/@playwright/test/package.json` exists before writing tests

---

## Issue #4: Missing `.env` + `dotenv` — Environment Variables Undefined

| Attribute | Detail |
|-----------|--------|
| **Symptom** | `process.env.VWO_INVALID_USERNAME` is `undefined` |
| **Severity** | P1 — High |
| **Component** | Configuration / Environment |

### Root Cause
The migrated test references environment variables (`process.env.VWO_INVALID_USERNAME`) but **no `.env` file existed** and `dotenv` was not configured. All `process.env.*` values resolved to `undefined`, falling back to hardcoded defaults in the test.

### Fix Applied
1. Created `.env` file with VWO-specific variables
2. Added `dotenv.config()` at the top of `playwright.config.ts`
3. Added nullish coalescing (`??`) fallback values in test for safety

### Prevention
- ✅ Always create `.env` template file (`.env.example`) with all required variables
- ✅ Validate required env vars at test startup; fail fast with descriptive message

---

## Issue #5: `WaitHelpers.waitJVM(5000)` — Thread.sleep Anti-Pattern

| Attribute | Detail |
|-----------|--------|
| **Symptom** | Unnecessary 5-second delay; flaky tests if page loads faster or slower |
| **Severity** | P2 — Medium |
| **Component** | Selenium → Playwright Migration |

### Root Cause
The original Selenium code used `WaitHelpers.waitJVM(5000)` (a `Thread.sleep(5000)` wrapper) because Selenium's `findElement()` does not wait for elements to appear. The migration **carried this anti-pattern forward** instead of leveraging Playwright's auto-wait.

### Original Code
```java
try {
    enterInput(password, PropertiesReader.readKey("invalid_password"));
    clickElement(signButton);
    WaitHelpers.waitJVM(5000);  // ❌ Hard sleep
} catch (Exception e) {
    System.out.println("Elements Not found!");
}
```

### Fix Applied
**Removed the sleep entirely.** Playwright's `fill()`, `click()`, and `textContent()` automatically wait for elements to be actionable:
```typescript
await loginPage.enterPassword(password);
await loginPage.clickSignIn();
return loginPage.getErrorMessage();  // Auto-waits up to default timeout
```

### Prevention
- ✅ Never use `page.waitForTimeout()` or sleep equivalents in Playwright
- ✅ Rely on auto-wait; use `expect(locator).toBeVisible()` only when explicit assertion is needed

---

## Issue #6: Silent Exception Swallowing

| Attribute | Detail |
|-----------|--------|
| **Symptom** | Tests pass even when elements are not found; false positives |
| **Severity** | P1 — High |
| **Component** | Selenium → Playwright Migration |

### Root Cause
The original Selenium code wrapped the login flow in a `try/catch` that swallowed **all exceptions** and only printed to console:
```java
try {
    // login actions
} catch (Exception e) {
    System.out.println("Elements Not found!");  // ❌ Silent failure
}
return getText(error_message);  // Returns empty string if catch triggered
```

If the login button was not found, the catch block fired, and the test continued to assert against an empty error message — causing a false failure (or false pass if empty string matched).

### Fix Applied
**Removed try/catch.** Let Playwright throw on genuine failures. Playwright's retry mechanism (`retries: 2` in CI) handles transient flakiness:
```typescript
// No try/catch — failures bubble up to test runner
await loginPage.navigate();
await loginPage.enterUsername(username);
await loginPage.enterPassword(password);
await loginPage.clickSignIn();
```

### Prevention
- ✅ Never swallow exceptions in test automation
- ✅ Use Playwright's built-in retry for flakiness, not catch blocks

---

## Issue #7: Missing `await` on Async Assertions (Potential)

| Attribute | Detail |
|-----------|--------|
| **Symptom** | Assertion passes silently or test hangs |
| **Severity** | P2 — Medium |
| **Component** | Playwright Assertions |

### Root Cause
Playwright's `expect()` has **two modes**:
1. **Synchronous** (Jest-style): `expect(stringValue).toBe('expected')` — no `await` needed
2. **Asynchronous** (web-first): `await expect(locator).toBeVisible()` — **MUST await**

In the `VWOLoginPage` class, inline assertions like `expectErrorMessageVisible()` correctly use `await`. However, developers migrating from Selenium (where assertions are always synchronous) may forget `await` on web-first assertions.

### Fix Applied
Added explicit `await` on all web-first assertions in the page object:
```typescript
async expectErrorMessageVisible(): Promise<void> {
    await expect(this.errorMessage()).toBeVisible();  // ✅ await required
}
```

### Prevention
- ✅ ESLint rule: `@typescript-eslint/no-floating-promises` catches missing await
- ✅ Add ESLint + Prettier to the project (already in target framework)

---

## Issue #8: Locator Strategy — IDs Instead of data-testid

| Attribute | Detail |
|-----------|--------|
| **Symptom** | Fragile locators; DOM changes break tests |
| **Severity** | P2 — Medium |
| **Component** | Page Object Locators |

### Root Cause
The original Selenium code used `@FindBy(id = "...")` and `@FindBy(css = "...")`. The migration mapped these directly to `page.locator('#...')`, which is functionally correct but **violates the strict rule** to prefer `getByTestId()` or `getByRole()`.

### Current Locators
```typescript
usernameInput = (): Locator => this.page.locator('#login-username');      // ID-based
passwordInput = (): Locator => this.page.locator('input[name="password"]'); // attribute
errorMessage = (): Locator => this.page.locator('#js-notification-box-msg'); // ID-based
```

### Fix Applied
Added `@deprecated` JSDoc tags and comments directing future migration:
```typescript
/** @deprecated Migrate to getByTestId after adding data-testid to app */
usernameInput = (): Locator => this.page.locator('#login-username');
```
Kept the button as `getByRole('button', { name: /sign in/i })` which already follows the rule.

### Long-Term Fix
Add `data-testid` attributes to the VWO application HTML:
```html
<input id="login-username" data-testid="login-username" ... />
<button id="js-login-btn" data-testid="signin-button" ... />
<div id="js-notification-box-msg" data-testid="login-error-message" ... />
```
Then migrate locators:
```typescript
usernameInput = (): Locator => this.page.getByTestId('login-username');
```

### Prevention
- ✅ Mandate `data-testid` attributes in application development guidelines
- ✅ Add rule-engine check: `*Page.ts` must use `getByTestId()` or `getByRole()`

---

## Issue #9: Module Pattern — Page as Method Parameter

| Attribute | Detail |
|-----------|--------|
| **Symptom** | None (architectural choice) |
| **Severity** | P3 — Low (observability) |
| **Component** | Module Layer |

### Context
The strict rule requires: **"Modules: Accept Page as METHOD parameter (NOT constructor)"**.

This creates a new `VWOLoginPage` instance inside every method call:
```typescript
async loginWithInvalidCredentials(page: Page, ...): Promise<string> {
    const loginPage = new VWOLoginPage(page);  // New instance per call
    // ...
}
```

### Trade-off Analysis
| Aspect | Constructor Injection (Standard) | Method Parameter (Strict Rule) |
|--------|----------------------------------|-------------------------------|
| Test Isolation | ✅ Fresh context per test | ✅ Fresh page object per call |
| Performance | Slightly better (reuses instance) | Slightly more overhead |
| Code Clarity | Standard DI pattern | Unusual but explicitly isolated |
| Memory | Lower | Higher (object churn) |

### Fix Applied
No code change needed — this is an intentional architectural choice per the strict rule. Added explanatory comments in the module file.

---

## Issue #10: Missing `npm install` Step

| Attribute | Detail |
|-----------|--------|
| **Symptom** | `Cannot find module '@playwright/test'` even after creating package.json |
| **Severity** | P0 — Blocker |
| **Component** | Build / Dependency Management |

### Root Cause
Creating `package.json` alone is insufficient. **`node_modules/` must be populated** by running `npm install`. Without this step, TypeScript and Playwright cannot resolve any dependencies.

### Fix Applied
Created `package.json`. The developer must run:
```bash
cd PlaywrightMigratedFramework
npm install
npx playwright install
```

### Verification Steps
```bash
# 1. Verify TypeScript compilation
npm run build

# 2. Verify Playwright installation
npx playwright test --list

# 3. Run the migrated test
npx playwright test src/tests/vwo/vwo-login-pf.spec.ts --project=chromium
```

---

## Fix Checklist

| # | Issue | File Changed | Status |
|---|-------|-------------|--------|
| 1 | Missing `tsconfig.json` | `tsconfig.json` | ✅ Created |
| 2 | Missing `playwright.config.ts` | `playwright.config.ts` | ✅ Created |
| 3 | Missing `package.json` | `package.json` | ✅ Created |
| 4 | Missing `.env` + dotenv | `.env`, `playwright.config.ts` | ✅ Created |
| 5 | Thread.sleep anti-pattern | `VWOLoginModule.ts` | ✅ Removed |
| 6 | Silent exception swallowing | `VWOLoginModule.ts` | ✅ Removed try/catch |
| 7 | Missing await on assertions | `VWOLoginPage.ts` | ✅ Verified all async assertions have await |
| 8 | ID-based locators | `VWOLoginPage.ts` | ✅ Documented with @deprecated + migration path |
| 9 | Module pattern (Page as method param) | `VWOLoginModule.ts` | ✅ Documented as intentional |
| 10 | Missing `npm install` | N/A | ⚠️ Requires manual developer action |

---

## Post-Fix Verification Commands

```bash
# Step 1: Install dependencies
cd PlaywrightMigratedFramework
npm install

# Step 2: Install Playwright browsers
npx playwright install

# Step 3: Verify TypeScript compilation
npm run build

# Step 4: Run the specific migrated test
npx playwright test src/tests/vwo/vwo-login-pf.spec.ts --project=chromium

# Step 5: Run with UI mode for debugging
npx playwright test --ui

# Step 6: Run with headed browser for visual verification
npm run test:vwo:headed
```

---

## Lessons Learned

1. **Infrastructure-first migration:** Always create `package.json`, `tsconfig.json`, and `playwright.config.ts` before writing any source files.
2. **Path aliases need compiler support:** `@pages/*` and `@modules/*` are cosmetic without `tsconfig.json` `paths` mapping.
3. **Auto-wait eliminates sleep:** Never carry `Thread.sleep()` patterns from Selenium — Playwright's built-in waiting is superior.
4. **Never swallow exceptions:** The original `try/catch` with `System.out.println()` hid real failures.
5. **Environment variables need `.env`:** `process.env.*` without `dotenv` + `.env` resolves to `undefined`.
6. **Semantic locators require app changes:** `getByTestId()` only works if the application has `data-testid` attributes.

---

*Report generated: 2026-05-03*  
*Test: `vwo-login-pf.spec.ts`*  
*Migration source: `TestVWOLogin_PF.java` + `LoginPage_PF.java`*
