# TTA Bank – Complete Conversation & Deliverables Record

**Application:** TTA Bank Digital Banking Portal  
**URL:** https://tta-bank-digital-973242068062.us-west1.run.app/  
**Folder:** `practice_06_playWright_CLI_Integration/exercise_02_TTA_BANK`  
**Date:** 2026-05-05  
**Skill Used:** `.github/playwright-cli/SKILL.md`  

---

## 1. Prompt Given by User

> 1. Open the https://tta-bank-digital-973242068062.us-west1.run.app/
> 2. Create a Dummy Signup with random email ID, name and details
> 3. Verify that the 50K $ balance is present
> 4. In the Transfer Funds Tab and transfer the amount to the 5000$ to default dropdown
> 5. Verify that in the dashboard it will be the 45K$ balance
> 6. Signout

---

## 2. Key Discoveries

### Discovery 1: Two-Step Transfer Flow
The **most critical finding** during exploration was that the Transfer Funds feature requires **two clicks** to complete:

| Step | UI Action | Result |
|------|-----------|--------|
| 1 | Fill amount → Click **Continue** | Review Transfer page appears |
| 2 | Click **Confirm Transfer** on review page | Transfer executes, balance updates |

**Impact:** Without clicking "Confirm Transfer", the balance remains at `$50,000.00` and the transfer is NOT processed. This was discovered through iterative exploration scripts (`explore-transfer-confirm.js`).

### Discovery 2: Default Dropdown Selections
- **From Account** defaults to: `Savings Account - 9938 (Available: $35,000)`
- **To Beneficiary** defaults to: `Sarah Smith (Chase) - 1234567890`
- No explicit dropdown selection is required for the default flow.

### Discovery 3: Page Structure
- Landing page: `Sign In` (submit) + `Sign Up` button
- Signup form: Full Name (text), Email (email), Password (password)
- Submit button text: `Create Account`
- Dashboard tabs: Dashboard, Transfer Funds, Expense Tracker, Transactions, AI Support, Settings, Sign Out

---

## 3. Actions Performed (Chronological)

| # | Action | Command / Details | Outcome |
|---|--------|-------------------|---------|
| 1 | Initialized Playwright project | `npm init -y && npm install @playwright/test` | Dependencies installed |
| 2 | Explored landing page structure | `node explore-page.js` | Discovered Sign In / Sign Up buttons, form inputs |
| 3 | Traced full user journey | `node explore-full-flow.js` | Found dashboard, transfer form, 50K balance |
| 4 | Attempted transfer without confirmation | `node explore-transfer-flow.js` | **Balance did NOT decrease** — identified missing step |
| 5 | Refreshed page after transfer | `node explore-transfer-refresh.js` | Confirmed balance stays at 50K without confirmation |
| 6 | Discovered Confirm Transfer button | `node explore-transfer-confirm.js` | **Balance updated to 45K after Confirm Transfer** |
| 7 | Created production test spec | `tests/tta-bank-e2e.spec.js` | 6 test steps with explicit assertions |
| 8 | Ran validation with recording | `npx playwright test --config=playwright.validation.config.js` | **1 passed (17.1s)** |

---

## 4. Test Case Steps Performed

### Test: `should signup, verify 50K balance, transfer 5K, verify 45K, and signout`

| Step | Description | Playwright Action | Expected Result | Status |
|------|-------------|-------------------|-----------------|--------|
| 1 | Navigate to TTA Bank | `page.goto('https://tta-bank-digital-...')` | Landing page loads with Sign Up button | ✅ |
| 2 | Click Sign Up | `page.getByRole('button', { name: 'Sign Up' }).click()` | Signup form visible | ✅ |
| 3 | Fill dummy user details | `fill()` on text, email, password inputs | Fields populated with random data | ✅ |
| 4 | Submit signup form | `page.getByRole('button', { name: 'Create Account' }).click()` | Dashboard loads | ✅ |
| 5 | Verify 50K balance | `expect(page.locator('body')).toContainText('$50,000.00')` | `$50,000.00` visible on dashboard | ✅ |
| 6 | Navigate to Transfer Funds | `page.getByRole('button', { name: 'Transfer Funds' }).click()` | Transfer form visible with amount input | ✅ |
| 7 | Fill transfer amount | `page.locator('input[type="number"]').first().fill('5000')` | Amount field shows 5000 | ✅ |
| 8 | Click Continue | `page.getByRole('button', { name: 'Continue' }).click()` | Review Transfer page appears | ✅ |
| 9 | Click Confirm Transfer | `page.getByRole('button', { name: 'Confirm Transfer' }).click()` | Transfer executes | ✅ |
| 10 | Verify 45K balance | `expect(page.locator('body')).toContainText('$45,000.00')` | `$45,000.00` visible on dashboard | ✅ |
| 11 | Sign out | `page.getByRole('button', { name: 'Sign Out' }).click()` | Redirected to login page | ✅ |

**Final Result:** `1 passed (17.1s)`

---

## 5. Files Saved – Location & Purpose

| File | Relative Path | Size | Purpose |
|------|--------------|------|---------|
| `tta-bank-e2e.spec.js` | `tests/tta-bank-e2e.spec.js` | ~4.3 KB | Production-ready E2E test spec |
| `playwright.config.js` | `playwright.config.js` | ~0.6 KB | Standard Playwright configuration |
| `playwright.validation.config.js` | `playwright.validation.config.js` | ~0.6 KB | Validation config (trace + video + screenshot always on) |
| `package.json` | `package.json` | ~0.6 KB | NPM scripts for test, validate, report |
| `prompts.md` | `prompts.md` | ~4.8 KB | Prompts & actions record |
| `conversation.md` | `conversation.md` | ~8 KB | **This file** – complete conversation & deliverables |
| `explore-page.js` | `explore-page.js` | ~4.1 KB | Initial page structure exploration script |
| `explore-full-flow.js` | `explore-full-flow.js` | ~8.2 KB | First full flow trace (discovered 50K balance) |
| `explore-transfer-flow.js` | `explore-transfer-flow.js` | ~6.6 KB | Transfer flow without confirmation (bug trace) |
| `explore-transfer-refresh.js` | `explore-transfer-refresh.js` | ~2.9 KB | Refresh test after transfer |
| `explore-transfer-confirm.js` | `explore-transfer-confirm.js` | ~3.1 KB | **Discovered Confirm Transfer step** |
| `trace.zip` | `test-results/tta-bank-e2e-.../trace.zip` | ~4.4 MB | Step-by-step DOM + network + console recording |
| `video.webm` | `test-results/tta-bank-e2e-.../video.webm` | ~302 KB | Full screen video recording of test execution |
| `test-finished-1.png` | `test-results/tta-bank-e2e-.../test-finished-1.png` | ~34 KB | Final screenshot after test completion |

### Exploration Screenshots (20+ files)

| Screenshot | Description |
|-----------|-------------|
| `exploration/01-landing-page.png` | TTA Bank landing page |
| `exploration/02-signup-page.png` | Signup form |
| `exploration/step1-landing-page.png` | Landing page (full flow trace) |
| `exploration/step2-signup-form.png` | Signup form (full flow trace) |
| `exploration/flow-step1-dashboard.png` | Dashboard after signup |
| `exploration/flow-step2-transfer-page.png` | Transfer Funds tab |
| `exploration/flow-step3-form-filled.png` | Transfer form with 5000 filled |
| `exploration/confirm-step3-after-continue.png` | **Review Transfer page** |
| `exploration/confirm-step5-dashboard-after-transfer.png` | Dashboard showing **$45,000.00** |
| `exploration/flow-step6-signout.png` | Page after sign out |

---

## 6. Validation Artifacts

### How to View
```bash
# Interactive trace viewer (step-by-step DOM replay)
cd exercise_02_TTA_BANK
npx playwright show-trace "test-results/<folder>/trace.zip"

# HTML report
npx playwright show-report

# Play video
start "test-results/<folder>/video.webm"
```

### Artifact Summary
| Type | File | Size | Content |
|------|------|------|---------|
| Trace | `trace.zip` | ~4.4 MB | DOM snapshots, network waterfall, console logs, action timeline |
| Video | `video.webm` | ~302 KB | Full 17-second screen recording of entire user journey |
| Screenshot | `test-finished-1.png` | ~34 KB | Final page state after sign out |

---

## 7. Useful Commands Reference

```bash
# Run standard tests
npx playwright test

# Run with full recording (trace + video + screenshot)
npx playwright test --config=playwright.validation.config.js

# Run in headed mode
npx playwright test --headed

# Debug mode
npx playwright test --debug

# View trace
npx playwright show-trace "test-results/<folder>/trace.zip"

# View HTML report
npx playwright show-report
```

---

## 8. Lessons Learned

1. **Always explore the full flow before writing tests.** The "Confirm Transfer" step was not obvious from the UI and was only discovered through iterative exploration.
2. **Use `test.step()` for readability.** Each major action in the test is wrapped in a descriptive step, making failures easy to pinpoint.
3. **Record everything during validation.** The `playwright.validation.config.js` with `trace=on`, `video=on`, `screenshot=on` provides irrefutable evidence of test execution.
4. **Balance assertions should reflect business requirements.** Even though the app might not update balances in real-time in all scenarios, the test asserts the expected behavior as defined by the prompt.

---

*End of record.*
