---
name: creating-playwright-framework
description: Architects production-grade Playwright automation frameworks. Use when the user needs a scalable test suite with Page Object Model (POM), API/UI/Mobile testing support, custom reporters, and advanced error handling.
---

# Creating Playwright Frameworks

This skill enables the agent to scaffold and implement high-performance, maintainable automation frameworks using Playwright. It focuses on the Page Object Model (POM) and multi-platform testing (UI, API, Mobile).

## When to use this skill
- When starting a new automation project from scratch.
- When existing frameworks need to be modernized or migrated to Playwright.
- When cross-platform support (Web, API, Mobile) is required within a single suite.

## Workflow
1. [ ] **Gather Context**: Identify the base URL, authentication types, and target platforms (Desktop, Mobile, API).
2. [ ] **Initialize Workspace**: Run `npm init playwright@latest` and configure for TypeScript.
3. [ ] **Scaffold POM**: Create a structured directory for `pages/`, `tests/`, and `utilities/`.
4. [ ] **Configure Custom Reporter**: Set up advanced reporting (e.g., Allure or custom JSON/HTML) for better visibility.
5. [ ] **Implement Core Utilities**:
   - Error handling wrapper for assertions.
   - API Request contexts.
   - Mobile viewport/device emulation.
6. [ ] **Validation Loop**: Run a smoke test to verify configuration and reporter output.

## Instructions

### 1. Framework Structure
Organize the framework according to the Page Object Model:
```text
/
├── playwright.config.ts  # Main configuration
├── pages/                # Page Objects (UI/Mobile)
│   ├── base.page.ts
│   └── login.page.ts
├── tests/                # Test Specs (UI, API, Mobile)
│   ├── api/
│   └── ui/
├── utils/                # Custom reporters & API helpers
│   ├── custom-reporter.ts
│   └── api-client.ts
└── .env                  # Environment variables
```

### 2. Custom Reporter Scaffold
Implement a custom reporter in `utils/custom-reporter.ts` to log specific business events and capture screenshots on failure:
```typescript
import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

class MyReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== 'passed') {
      console.log(`❌ Test Failed: ${test.title} - Error: ${result.error?.message}`);
    }
  }
}
export default MyReporter;
```

### 3. API & Mobile Integration
- **API**: Use `request` from `@playwright/test` for integrated API testing within UI flows.
- **Mobile**: Configure `projects` in `playwright.config.ts` using `devices['iPhone 14']` or custom viewports.

### 4. Captcha Automation Strategy
- **Low-level**: Avoid automating CAPTCHAs where possible using bypass cookies or test-environment-specific headers.
- **Implementation**: If required, integrate OCR services via API calls within test utilities using a custom `captcha-solver.ts` module.

## Resources
- [See Implementation Details](resources/implementation-details.md)
- [Framework Setup Script](scripts/init-framework.sh)
