# RICE POT Test Automation Protocol: VWO Login Module

## 1. Overview
**Application Under Test:** VWO (Visual Website Optimizer)
**Target URL:** `https://app.vwo.com`
**Architecture:** Single Page Application (SPA), multi-language support, cookie-based sessions.

## 2. Test Cases Matrix (RICE POT Analysis)

| TC_ID | Category | Locale | Expected Behavior | Credentials Strategy | RICE Score Estimate |
|-------|----------|---------|-------------------|----------------------|-----------------------|
| TC-01 | Positive | en-US | Dashboard load < 2s | Valid production-grade | R:9 I:9 C:9 E:2 => High |
| TC-02 | Negative | ar-SA | "Invalid credentials" error (Arabic UI) | Valid email format, invalid password | R:6 I:7 C:8 E:4 => Med |
| TC-03 | Negative | zh-CN | Client-side validation error (Chinese UI)| Invalid email format (special chars) | R:6 I:7 C:8 E:4 => Med |
| TC-04 | Security | en-US | Input sanitization, no server error | SQL injection attempt in password | R:8 I:9 C:8 E:5 => High |
| TC-05 | Session | en-US | "Remember Me" functionality validation | Valid login → Logout → Browser close | R:7 I:8 C:9 E:4 => High |

## 3. Automation Strategy & Execution Plan
* **Framework:** Playwright (TypeScript/Node.js) with Page Object Model (POM) + Factory Pattern.
* **JIRA Integration:** Automated ticket generation for Test issues and Test Execution results using MCP servers.
* **Reporting:** HTML Report + JSON outputs for JIRA Xray/Zephyr ingestion. Trace loops and screenshot-on-failure implemented.

### Phase 1: Test Initialization & Design
We utilize environmental constants for test data isolation (`process.env.VWO_VALID_EMAIL`). Tests are developed using Playwright `expect().toPass()` polling for resilience without hardcoded sleeps.

### Phase 2: JIRA Integration (Mocked MCP)
1. Invoke JIRA MCP `jira_create_issue` for TC-01 to TC-05.
2. Link to Story `VWO-LOGIN-001`.
3. Labels: `automation`, `playwright`, `login-regression`, `rice-pot`.

### Phase 3: Playwright Execution
TC-01, TC-02, TC-03, TC-05 are designed to PASS.
TC-04 is intentionally engineered to trigger a failure to validate the automated defect tracking pipeline.
*   **Screenshot Captured:** `bugs/TC-04-security-fail.png`

### Phase 4: Reporting and Defect Creation
For the TC-04 failure, a High-Priority Defect is synthesized via the JIRA MCP:
* **Summary:** `[AUTO] Login Security: TC-04 Input Sanitization Failure`
* **Severity/Component:** High Priority / Authentication Security.

## 4. MCP Tools Requirements
*(Note: These tools must be explicitly registered and authorized in your MCP configuration to execute live JIRA updates or Playwright commands through the assistant)*:
- `jira_create_issue`
- `playwright_navigate`
- `playwright_execute_test`
- `playwright_screenshot`
- `jira_add_attachment`
- `jira_transition_issue`
