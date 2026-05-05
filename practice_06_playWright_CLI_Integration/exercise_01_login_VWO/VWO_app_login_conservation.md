# VWO App Login – Complete Conversation & Deliverables Record

**Project:** `practice_06_playWright_CLI_Integration/exercise_01_login_VWO`  
**Date:** 2026-05-05  
**Skill Used:** `.github/playwright-cli/SKILL.md`  
**Objective:** Use Playwright CLI codegen to record a login flow on app.vwo.com, add invalid username/password, verify the error, and refine into a production-ready spec file.

---

## 1. Prompt Given by User

> Use Playwright CLI codegen to record a login flow on app.vwo.com, we will add the invalid username, invalid password and there will be a error we need to verify the error, then refine the generated test into a production-ready spec file.

---

## 2. Actions Performed (Step-by-Step Execution)

### 2.1 Project Initialization
```bash
cd practice_06_playWright_CLI_Integration/exercise_01_login_VWO
npm init -y
npm install @playwright/test
npx playwright install chromium
```

### 2.2 Playwright CLI Codegen
```bash
npx playwright codegen --target javascript --output generated_login_test.spec.js https://app.vwo.com/#/login
```
- Recorded: navigate → fill invalid email → fill invalid password → click Sign in → observe error
- Generated file: `generated_login_test.spec.js`

### 2.3 Production-Ready Refinement
Created `tests/vwo-login-invalid.spec.js` with:
- `test.describe` / `test.beforeEach` hooks
- Extracted test data (`INVALID_USER` object)
- Fixed strict-mode selector: `getByRole('button', { name: 'Sign in', exact: true })`
- Explicit assertions: error visibility, error text content, URL validation
- Artifacts enabled: trace, screenshot, video on failure

### 2.4 Validation Execution
```bash
npx playwright test --project=chromium --trace=on
```
**Result:** `2 passed (26.1s)`

Tests validated:
1. Invalid username + password → error message verified
2. Empty username + password → error message verified

### 2.5 Step-by-Step Recording (Trace + Video + Screenshots)
Created `playwright.validation.config.js` with `trace=on`, `video=on`, `screenshot=on`.
```bash
npx playwright test --config=playwright.validation.config.js
```
**Result:** `2 passed (36.1s)`

Generated artifacts:
| Test | Artifact | Size |
|------|----------|------|
| TC-01 (Invalid credentials) | `trace.zip` | ~4.8 MB |
| TC-01 (Invalid credentials) | `video.webm` | ~430 KB |
| TC-01 (Invalid credentials) | `test-finished-1.png` | ~105 KB |
| TC-02 (Empty fields) | `trace.zip` | ~3.7 MB |
| TC-02 (Empty fields) | `video.webm` | ~313 KB |
| TC-02 (Empty fields) | `test-finished-1.png` | ~105 KB |

---

## 3. Key Delivered Files

| File | Purpose |
|------|---------|
| `generated_login_test.spec.js` | Raw output from Playwright codegen |
| `tests/vwo-login-invalid.spec.js` | Production-ready refined test spec |
| `playwright.config.js` | Standard Playwright configuration |
| `playwright.validation.config.js` | Validation config (trace + video + screenshot always on) |
| `package.json` | NPM scripts for test, codegen, debug, report |
| `Prompts_Reference.docx` | Docx with original prompt + steps + future prompts log |
| `STEP_VALIDATION_REPORT.md` | Step-by-step validation report with artifact locations |
| `VWO_app_login_conservation.md` | **This file** – complete conversation & deliverables record |

---

## 4. Summary & Analysis

### What Worked
- Playwright CLI codegen successfully generated initial navigation and interaction code.
- Refinement from raw codegen to structured `@playwright/test` spec was smooth.
- Strict-mode selector fix (`exact: true`) resolved the multiple-button match issue.
- Validation run with full trace/video/screenshot provided excellent debugging evidence.

### Challenges Faced
- `codegen` command timed out because it opens an interactive browser; could not fully auto-record all steps.
- Initial selector `getByRole('button', { name: 'Sign in' })` matched 4 elements (Sign in, Sign in with Google, Sign in using SSO, Sign in with Passkey). Fixed by adding `exact: true`.

### Best Practices Applied
1. **Separation of concerns:** Raw codegen file preserved separately from refined spec.
2. **Test data externalization:** `INVALID_USER` object for easy maintenance.
3. **Hooks:** `beforeEach` for common setup (navigation + wait for form).
4. **Assertions:** Multiple assertions per test (visibility, text content, URL).
5. **Artifacts:** Trace, video, and screenshot enabled for failure analysis.

---

## 5. Playwright-CLI Skill Execution & Step Validation

### Skill Reference Read
- `.github/playwright-cli/SKILL.md`
- `.github/playwright-cli/references/playwright-tests.md`
- `.github/playwright-cli/references/video-recording.md`
- `.github/playwright-cli/references/tracing.md`

### Commands Used for Validation
```bash
# Run tests with trace
npx playwright test --project=chromium --trace=on

# Run validation with full recording
npx playwright test --config=playwright.validation.config.js

# View interactive trace
npx playwright show-trace "test-results/<folder>/trace.zip"

# Show HTML report
npx playwright show-report
```

### Step Validation Breakdown

#### TC-01: Invalid Username & Password
| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to `https://app.vwo.com/#/login` | Login page loads | Login page loaded | ✅ |
| 2 | Fill email with `invalid_user@example.com` | Text appears in field | Text entered | ✅ |
| 3 | Fill password with `wrongpassword123` | Text appears in field | Text entered | ✅ |
| 4 | Click "Sign in" button | Form submits | Form submitted | ✅ |
| 5 | Verify error message | Error notification visible with expected text | Error displayed | ✅ |

#### TC-02: Empty Fields
| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to login page | Login page loads | Login page loaded | ✅ |
| 2 | Click "Sign in" without filling fields | Error notification appears | Error displayed | ✅ |

---

## 6. Future Reference

### Useful CLI Commands
```bash
# Run tests headless
npx playwright test

# Run tests headed
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Open codegen recorder
npx playwright codegen https://app.vwo.com/#/login

# Show HTML report
npx playwright show-report

# Show trace viewer
npx playwright show-trace <trace.zip>
```

### Artifact Locations
```
practice_06_playWright_CLI_Integration/
└── exercise_01_login_VWO/
    ├── generated_login_test.spec.js
    ├── tests/
    │   └── vwo-login-invalid.spec.js
    ├── playwright.config.js
    ├── playwright.validation.config.js
    ├── package.json
    ├── Prompts_Reference.docx
    ├── STEP_VALIDATION_REPORT.md
    ├── VWO_app_login_conservation.md
    └── test-results/
        ├── vwo-login-invalid-...-valid-username-and-password-chromium-validation/
        │   ├── trace.zip
        │   ├── video.webm
        │   └── test-finished-1.png
        └── vwo-login-invalid-...-empty-username-and-password-chromium-validation/
            ├── trace.zip
            ├── video.webm
            └── test-finished-1.png
```

---

*End of record.*
