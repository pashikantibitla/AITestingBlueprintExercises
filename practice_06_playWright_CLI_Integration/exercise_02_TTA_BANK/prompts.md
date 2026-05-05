# TTA Bank – Prompts & Actions Record

**Application URL:** https://tta-bank-digital-973242068062.us-west1.run.app/  
**Folder:** `practice_06_playWright_CLI_Integration/exercise_02_TTA_BANK`  
**Date:** 2026-05-05  
**Skill Used:** `.github/playwright-cli/SKILL.md`

---

## Prompt 1: Original User Request

> 1. Open the https://tta-bank-digital-973242068062.us-west1.run.app/
> 2. Create a Dummy Signup with random email ID, name and details
> 3. Verify that the 50K $ balance is present
> 4. In the Transfer Funds Tab and transfer the amount to the 5000$ to default dropdown
> 5. Verify that in the dashboard it will be the 45K$ balance
> 6. Signout

---

## Actions Taken

### Step 1: Project Setup
```bash
cd practice_06_playWright_CLI_Integration/exercise_02_TTA_BANK
npm init -y
npm install @playwright/test
```

### Step 2: Page Exploration (Playwright CLI + Node Script)
Created `explore-page.js` to inspect the TTA Bank UI:
- Landing page: Sign In / Sign Up buttons
- Signup form: Full Name, Email Address, Password
- Submit button: "Create Account"
- Dashboard tabs: Dashboard, Transfer Funds, Expense Tracker, Transactions, AI Support, Settings

### Step 3: Full Flow Exploration
Created `explore-full-flow.js` to manually trace the user journey:
- Discovered dashboard shows `$50,000.00` after signup
- Transfer Funds page has:
  - Amount input (number)
  - Note input (text)
  - From Account dropdown: Savings Account - 9938 ($35,000), Current Account - 8821 ($15,000)
  - To Beneficiary dropdown: Sarah Smith (Chase), Landlord (Wells Fargo)
- After clicking "Continue", a **Review Transfer** page appears with:
  - "Back" button
  - **"Confirm Transfer"** button (this was the missing step!)
- After confirming, balance updates to `$45,000.00`

### Step 4: Production-Ready Test Spec
Created `tests/tta-bank-e2e.spec.js` with:
- `generateRandomUser()` utility for dummy data
- `test.step()` wrappers for each scenario step
- Explicit assertions at every verification point
- Proper waits for page transitions

### Step 5: Validation Execution
```bash
npx playwright test --config=playwright.validation.config.js
```
**Result:** `1 passed (17.1s)`

Config used: `trace=on`, `screenshot=on`, `video=on`

---

## Test Case Breakdown

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to TTA Bank | Landing page loads | ✅ |
| 2 | Click Sign Up | Signup form visible | ✅ |
| 3 | Fill random name, email, password | Fields populated | ✅ |
| 4 | Click Create Account | Dashboard loads | ✅ |
| 5 | Verify balance | `$50,000.00` visible | ✅ |
| 6 | Click Transfer Funds | Transfer form visible | ✅ |
| 7 | Fill amount `$5,000` | Amount entered | ✅ |
| 8 | Click Continue | Review Transfer page appears | ✅ |
| 9 | Click Confirm Transfer | Transfer executed | ✅ |
| 10 | Go to Dashboard | Balance shows `$45,000.00` | ✅ |
| 11 | Click Sign Out | Redirected to login page | ✅ |

---

## Key Findings / Gotchas

1. **Transfer Flow has 2 steps:**
   - Step 1: Fill form → Click **Continue**
   - Step 2: Review page → Click **Confirm Transfer**
   - *Without clicking Confirm Transfer, the transfer is NOT executed and balance does not change.*

2. **Balance updates only after confirmation:**
   - After "Continue": balance still `$50,000.00`
   - After "Confirm Transfer": balance becomes `$45,000.00`

3. **Default dropdown selections work as-is:**
   - "From Account" defaults to Savings Account - 9938
   - "To Beneficiary" defaults to Sarah Smith (Chase)

---

## Generated Artifacts

| Artifact | Location | Size |
|----------|----------|------|
| Trace (step-by-step DOM + network) | `test-results/.../trace.zip` | ~4.4 MB |
| Video recording | `test-results/.../video.webm` | ~302 KB |
| Final screenshot | `test-results/.../test-finished-1.png` | ~34 KB |

---

## Useful Commands

```bash
# Run tests
npx playwright test

# Run with full recording (trace + video + screenshot)
npx playwright test --config=playwright.validation.config.js

# View trace interactively
npx playwright show-trace "test-results/<folder>/trace.zip"

# Show HTML report
npx playwright show-report
```

---

## Files Created

| File | Purpose |
|------|---------|
| `tests/tta-bank-e2e.spec.js` | Production-ready E2E test spec |
| `playwright.config.js` | Standard Playwright configuration |
| `playwright.validation.config.js` | Validation config (always records artifacts) |
| `package.json` | NPM scripts |
| `explore-page.js` | Initial page structure exploration |
| `explore-full-flow.js` | Full manual flow tracing |
| `explore-transfer-confirm.js` | Discovered the Confirm Transfer step |
| `prompts.md` | **This file** – prompts & actions record |

---

*End of record.*
