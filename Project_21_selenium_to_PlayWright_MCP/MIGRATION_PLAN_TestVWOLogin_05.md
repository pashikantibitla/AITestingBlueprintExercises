# Migration Plan: TestVWOLogin_05 into PlaywrightMigratedFramework

> **Target Repository:** `PlaywrightMigratedFramework`  
> **Source Test Case:** `TestVWOLogin_05_TakeScreen_Retry_Prop_Improved_POM.java`  
> **Source Framework:** `ATB13xSeleniumAdvanceFramework` (Selenium + TestNG + Java)  
> **Target Framework:** `Advance-Playwright-Framework` (Playwright + TypeScript)  
> **Rule:** ANALYZE & PLAN ONLY — No Playwright code generation in this step.

---

## 1. Executive Summary

This document outlines the step-by-step migration plan for moving **TestVWOLogin_05_TakeScreen_Retry_Prop_Improved_POM** (and its full dependency chain) from the Selenium-Java-TestNG framework into a new `PlaywrightMigratedFramework` that inherits architecture patterns from the `Advance-Playwright-Framework`.

The source test demonstrates four cross-cutting concerns:
1. **Screenshot on Failure** (`ScreenshotListener` — TestNG `ITestListener`)
2. **Test Retry** (`RetryAnalyzer` — TestNG `IRetryAnalyzer`, max 3 retries)
3. **Allure Reporting** (`@Owner`, `@Description` annotations)
4. **Log4j2 Logging** (structured logger per test class)

Although `TestVWOLogin_05` itself is a minimal smoke test (`getDriver().get(url)` + hard assert true/false), it sits on top of the **Improved POM** stack built in Parts 1-3. A meaningful migration must therefore include the full VWO page-object layer (`LoginPage`, `DashBoardPage`), the base wrappers (`CommonToAllPage`), config reader (`PropertiesReader`), and wait utilities (`WaitHelpers`).

---

## 2. Framework Analysis

### 2.1 Source Framework (Selenium)

| Layer | Responsibility | Key Files |
|-------|---------------|-----------|
| **Driver** | Static singleton WebDriver manager | `DriverManager.java` |
| **Base Page** | Common wrapper methods (click, fill, getText, openURL) | `CommonToAllPage.java` |
| **Base Test** | `@BeforeMethod` / `@AfterMethod` driver lifecycle | `CommonToAllTest.java` |
| **Pages** | VWO-specific locators & actions (Improved POM) | `LoginPage.java`, `DashBoardPage.java` |
| **Utils** | Config reader, waits, screenshot helper | `PropertiesReader.java`, `WaitHelpers.java`, `TakeScreenShot.java` |
| **Listeners** | Retry logic & screenshot-on-failure | `RetryAnalyzer.java`, `RetryListener.java`, `ScreenshotListener.java` |
| **Tests** | TestNG test classes with Allure annotations | `TestVWOLogin_05_TakeScreen_Retry_Prop_Improved_POM.java` |
| **Config** | Key-value pairs in `.properties` file | `data.properties` |
| **Build** | Maven + TestNG + Allure + Log4j2 | `pom.xml`, `testng_*.xml` |

### 2.2 Target Framework (Playwright)

| Layer | Responsibility | Key Files |
|-------|---------------|-----------|
| **Config** | Environment variables, path aliases, dotenv | `playwright.config.ts`, `src/config/index.ts`, `.env` |
| **Fixtures** | Custom `test` fixture wiring Pages + Modules + auth | `src/fixtures/index.ts` |
| **Pages** | Arrow-function locators + simple actions + inline assertions | `src/pages/*.ts` |
| **Modules** | Business workflows orchestrating multiple page actions | `src/modules/*.ts` |
| **Utils** | Logger, WaitHelper, DataGenerator, ApiHelper, CustomTTAReporter | `src/utils/*.ts` |
| **API** | REST API wrappers for auth/products/orders | `src/api/*.ts` |
| **Tests** | Playwright `test()` specs using fixtures | `src/tests/**/*.spec.ts` |
| **Build** | npm + TypeScript + ESLint + Prettier + Husky | `package.json`, `tsconfig.json` |

### 2.3 Architectural Mapping

```
Selenium Layer                          Playwright Layer
─────────────────────────────────────────────────────────────────
DriverManager (static singleton)   ->   Playwright built-in + playwright.config.ts
CommonToAllTest (@Before/@After)   ->   test.beforeEach / test.afterEach (or built-in context)
CommonToAllPage (wrapper methods)  ->   Page class methods OR absorbed into individual pages
LoginPage / DashBoardPage          ->   VWOLoginPage.ts / VWODashboardPage.ts
PropertiesReader                   ->   dotenv + src/config/vwo.config.ts
WaitHelpers                        ->   Playwright auto-waits + src/utils/WaitHelper.ts
TakeScreenShot                     ->   screenshot: 'only-on-failure' + CustomTTAReporter
RetryAnalyzer (3 retries)          ->   retries: 2 in playwright.config.ts (CI conditional)
ScreenshotListener                 ->   screenshot/video/trace: 'retain-on-failure'
Allure @Owner / @Description      ->   test.describe() labels / test.step() / CustomTTAReporter metadata
Log4j2 Logger                      ->   src/utils/Logger.ts (structured console logger)
TestNG Assert / AssertJ            ->   Playwright expect() + test assertions
data.properties                    ->   .env + JSON testdata + src/config/vwo.config.ts
```

---

## 3. Java Files -> TypeScript Equivalents

The following table lists **every Java file** that requires a TypeScript equivalent (or a conscious decision to drop/absorb it) for migrating `TestVWOLogin_05` and its underlying Improved POM stack.

### 3.1 Core Test File

| # | Java File (Source Path) | TypeScript Equivalent (Target Path) | Decision |
|---|------------------------|-------------------------------------|----------|
| 1 | `src/test/java/com/thetestingacademy/tests/vwo/pageObjectModelTC/TestVWOLogin_05_TakeScreen_Retry_Prop_Improved_POM.java` | `src/tests/vwo/vwo-login-screenshot-retry.spec.ts` | **Migrate** — main test case |

### 3.2 Base & Infrastructure Files

| # | Java File (Source Path) | TypeScript Equivalent (Target Path) | Decision |
|---|------------------------|-------------------------------------|----------|
| 2 | `src/test/java/com/thetestingacademy/base/CommonToAllTest.java` | *None* | **Drop / Absorb** — Playwright handles browser lifecycle via `playwright.config.ts` and fixtures. `test.beforeEach`/`test.afterEach` can be added in spec file if VWO-specific setup is needed. |
| 3 | `src/main/java/com/thetestingacademy/base/CommonToAllPage.java` | `src/pages/vwo/BaseVWOPage.ts` (optional) OR inline into pages | **Absorb** — The Advanced Playwright Framework does not use a shared base page class. Each page is self-contained. Reusable navigation methods (`openVWOUrl`) can become a small `BaseVWOPage` OR be inlined into `VWOLoginPage`. Recommendation: keep it minimal and inline to match target framework style. |
| 4 | `src/main/java/com/thetestingacademy/driver/DriverManager.java` | *None* | **Drop** — Playwright's `Browser`, `BrowserContext`, and `Page` are managed by the test runner and fixtures. No manual driver singleton required. |
| 5 | `src/main/java/com/thetestingacademy/driver/DriverManagerTL.java` | *None* | **Drop** — ThreadLocal is not needed; Playwright tests run in isolated processes/contexts. |

### 3.3 Page Object Files (Improved POM)

| # | Java File (Source Path) | TypeScript Equivalent (Target Path) | Decision |
|---|------------------------|-------------------------------------|----------|
| 6 | `src/main/java/com/thetestingacademy/pages/pageObjectModel/vwo/improved_POM/LoginPage.java` | `src/pages/vwo/VWOLoginPage.ts` | **Migrate** — core page object for VWO login |
| 7 | `src/main/java/com/thetestingacademy/pages/pageObjectModel/vwo/improved_POM/DashBoardPage.java` | `src/pages/vwo/VWODashboardPage.ts` | **Migrate** — core page object for VWO dashboard |

> **Note:** The Selenium framework also contains `normal_POM` variants and `pageFactory` variants. These are **not** in scope for this first test case because `TestVWOLogin_05` explicitly uses the **Improved POM** package.

### 3.4 Utility Files

| # | Java File (Source Path) | TypeScript Equivalent (Target Path) | Decision |
|---|------------------------|-------------------------------------|----------|
| 8 | `src/main/java/com/thetestingacademy/utils/PropertiesReader.java` | `src/config/vwo.config.ts` + `.env` | **Replace** — Migrate from file-system Properties loader to `dotenv` + typed config object. VWO-specific keys (`url`, `username`, `password`, etc.) become environment variables or a typed config module. |
| 9 | `src/main/java/com/thetestingacademy/utils/WaitHelpers.java` | *None* (use existing `src/utils/WaitHelper.ts`) | **Reuse** — The target framework already has a `WaitHelper.ts` with polling waits, retry logic, and stability checks. Add VWO-specific wait methods only if Playwright's auto-waits are insufficient. |
| 10 | `src/main/java/com/thetestingacademy/utils/TakeScreenShot.java` | *None* | **Drop / Absorb** — Playwright config provides `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `trace: 'retain-on-failure'`. The `CustomTTAReporter` already copies screenshots/videos/traces into `tta-report/`. No manual screenshot class needed. |
| 11 | `src/test/java/com/thetestingacademy/utilsExcel/UtilExcel.java` | *None* (for this test case) | **Defer** — `TestVWOLogin_05` does not read Excel test data. Can be added later when migrating data-driven tests. |

### 3.5 Listener Files

| # | Java File (Source Path) | TypeScript Equivalent (Target Path) | Decision |
|---|------------------------|-------------------------------------|----------|
| 12 | `src/test/java/com/thetestingacademy/listeners/RetryAnalyzer.java` | `playwright.config.ts` (`retries` field) | **Replace** — Playwright natively supports retries at config level (`retries: process.env.CI ? 2 : 0`). The original Selenium test uses `maxRetryCount = 3`. Map this to the config value. |
| 13 | `src/test/java/com/thetestingacademy/listeners/RetryListener.java` | *None* | **Drop** — `IAnnotationTransformer` is TestNG-specific. Playwright retries are global or per-project in config. |
| 14 | `src/test/java/com/thetestingacademy/listeners/ScreenshotListener.java` | `playwright.config.ts` (`screenshot` field) + `CustomTTAReporter.ts` | **Replace** — Playwright's built-in `screenshot: 'only-on-failure'` plus the custom reporter's attachment logic replace the TestNG listener pattern. |

### 3.6 Configuration & Build Files

| # | Java File / Resource (Source Path) | TypeScript Equivalent (Target Path) | Decision |
|---|-----------------------------------|-------------------------------------|----------|
| 15 | `src/main/resources/data.properties` | `.env` + `src/config/vwo.config.ts` + `src/testdata/vwo.json` | **Replace** — Migrate key-value properties to: (a) `.env` for secrets/credentials, (b) typed `vwo.config.ts` for URL/timeouts, (c) JSON testdata for username/password combos. |
| 16 | `src/main/resources/log4j2.xml` | *None* | **Drop** — The target framework uses `src/utils/Logger.ts` (structured console logger). No XML configuration needed. |
| 17 | `pom.xml` | *None* (use existing `package.json`) | **Drop** — Maven dependencies are replaced by npm packages already present in `Advance-Playwright-Framework` (`@playwright/test`, `typescript`, `dotenv`). |
| 18 | `testng_vwo_takescreenshot_retry_prop_improved_pom_part5.xml` | *None* | **Drop** — TestNG suite XML is replaced by Playwright's `playwright.config.ts` `projects` and `grep` tagging. |

### 3.7 New Files Required (Target Framework Patterns)

The `Advance-Playwright-Framework` introduces layers that do **not** exist in the Selenium framework but are mandatory for conformance:

| # | New TypeScript File (Target Path) | Purpose |
|---|-----------------------------------|---------|
| 19 | `src/modules/vwo/VWOLoginModule.ts` | **NEW** — Business workflow layer. Orchestrates `VWOLoginPage` + `VWODashboardPage` actions (e.g., `doLogin`, `attemptInvalidLogin`, `verifyLoggedIn`). Selenium has no Module layer; this must be created. |
| 20 | `src/fixtures/vwo.fixture.ts` (or extend `src/fixtures/index.ts`) | **NEW / Extend** — Custom fixture wiring `vwoLoginPage`, `vwoDashboardPage`, `vwoLoginModule`. |
| 21 | `src/testdata/vwo.json` | **NEW** — VWO test data (valid/invalid credentials, expected messages) migrated from `data.properties`. |
| 22 | `src/testdata/types.ts` (or extend existing) | **NEW / Extend** — TypeScript interfaces for VWO test data (e.g., `VWOUser`, `VWOConfig`). |

---

## 4. Migration Order: API -> Pages -> Modules -> Tests

> This is the recommended execution order for the actual migration (coding phase).

### Phase 1: Environment & Config (Foundation)
**Before touching any page or test, establish the VWO environment.**

1. **Create `.env` file** in `PlaywrightMigratedFramework` root with VWO-specific variables:
   - `VWO_BASE_URL=https://app.vwo.com`
   - `VWO_USERNAME=...`
   - `VWO_PASSWORD=...`
   - `VWO_INVALID_USERNAME=...`
   - `VWO_INVALID_PASSWORD=...`
   - `VWO_EXPECTED_ERROR_MESSAGE=...`

2. **Create / extend `src/config/vwo.config.ts`**
   - Typed `VWOConfig` interface.
   - Load VWO values from `process.env` with fallbacks.
   - Export `vwoConfig` object.

3. **Create `src/testdata/vwo.json`**
   - Migrate non-secret test data from `data.properties` (expected usernames, error messages).

4. **Update `tsconfig.json` path aliases** (if needed)
   - Ensure `@pages/*`, `@modules/*`, `@config/*`, `@testdata/*` resolve correctly.

### Phase 2: API Layer (Optional but Recommended)
**The original Selenium test does not call APIs, but the target framework has an API layer. Setting up auth API now enables future tests to use `authenticatedPage` fixture efficiently.**

5. **Create `src/api/vwo/VWOAuthApi.ts`** (optional for this test, but aligns with target architecture)
   - `login(credentials)` -> returns tokens/session info.
   - `logout()` -> ends session.
   - This is a **forward-looking** step; the immediate `TestVWOLogin_05` does not require it.

### Phase 3: Pages (POM Layer)
**Migrate the Improved POM pages following the target framework's arrow-function locator pattern.**

6. **Create `src/pages/vwo/VWOLoginPage.ts`**
   - Constructor receives `page: Page`.
   - Locators as arrow functions: `usernameInput = () => this.page.locator('#login-username')`.
   - Actions: `enterUsername`, `enterPassword`, `clickSignIn`, `getErrorMessage`, `navigateToVWO`.
   - Inline assertions: `expectErrorVisible`, `expectOnLoginPage`.

7. **Create `src/pages/vwo/VWODashboardPage.ts`**
   - Locator: `userNameOnDashboard = () => this.page.locator('h6')` (or more specific selector).
   - Actions: `getLoggedInUserName`, `expectDashboardLoaded`.

8. **Create `src/pages/vwo/index.ts` barrel file**
   - Re-export `VWOLoginPage` and `VWODashboardPage`.

### Phase 4: Modules (Business Logic Layer)
**This is a net-new layer not present in Selenium. It decouples test scenarios from raw page interactions.**

9. **Create `src/modules/vwo/VWOLoginModule.ts`**
   - Constructor receives `page: Page`.
   - Instantiates `VWOLoginPage` and `VWODashboardPage` internally.
   - Methods:
     - `doLogin(username, password): Promise<void>` — valid creds flow.
     - `attemptInvalidLogin(username, password): Promise<string>` — invalid creds flow, returns error message.
     - `verifyLoggedIn(): Promise<void>` — checks dashboard visibility.
   - Uses `Logger.create('VWOLoginModule')` for step logging.

10. **Create `src/modules/vwo/index.ts` barrel file**
    - Re-export `VWOLoginModule`.

### Phase 5: Fixtures (Wiring Layer)
**Connect Pages and Modules to Playwright's `test` object so tests receive pre-wired objects.**

11. **Extend `src/fixtures/index.ts` (or create `src/fixtures/vwo.fixture.ts`)**
    - Add fixtures:
      - `vwoLoginPage: VWOLoginPage`
      - `vwoDashboardPage: VWODashboardPage`
      - `vwoLoginModule: VWOLoginModule`
    - Follow the existing pattern: `async ({ page }, use) => { await use(new VWOLoginPage(page)); }`.

### Phase 6: Tests (Spec Layer)
**Finally, write the migrated test spec.**

12. **Create `src/tests/vwo/vwo-login-screenshot-retry.spec.ts`**
    - Import `test`, `expect` from the custom fixtures.
    - Map `testFail` and `testPass` from the original Java class.
    - Use `test.step()` for Allure-like step descriptions.
    - Add tags: `@VWO`, `@Login`, `@Smoke`, `@Regression`.
    - Replace `Assert.assertTrue(false)` with Playwright assertion patterns.
    - Replace `Assert.assertTrue(true)` with meaningful validation (or keep as explicit smoke pass).
    - Logging via `Logger` utility instead of Log4j2.

### Phase 7: Configuration & Validation

13. **Update `playwright.config.ts`**
    - Set `baseURL: process.env.VWO_BASE_URL || 'https://app.vwo.com'`.
    - Confirm `retries: 2` (or map to 3 if strict parity with `RetryAnalyzer` is required).
    - Confirm `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `trace: 'retain-on-failure'`.
    - Add a VWO project or use default chromium.

14. **Update `package.json` scripts** (if needed)
    - Add `"test:vwo": "playwright test --grep @VWO"`.

15. **Run validation**
    - `npx playwright test src/tests/vwo/vwo-login-screenshot-retry.spec.ts --project=chromium`
    - Verify screenshots are captured on failure in `test-results/` and `tta-report/`.
    - Verify retries execute as configured.

---

## 5. Feature-by-Feature Migration Strategy

### 5.1 Screenshot on Failure

| Aspect | Selenium (Source) | Playwright (Target) |
|--------|-------------------|---------------------|
| Mechanism | `ScreenshotListener` implements `ITestListener.onTestFailure()` | Built-in `screenshot: 'only-on-failure'` in `playwright.config.ts` |
| File saving | Manual `FileUtils.copyFile()` to `failure_screenshots/` | Auto-saved to `test-results/`; `CustomTTAReporter` copies to `tta-report/screenshots/` |
| Allure attachment | `Allure.addAttachment("Screenshot", ...)` | Custom reporter can read `testInfo.attachments` and embed them |
| Code footprint | ~50 lines of listener code | **Zero** custom code needed; purely config-driven |

### 5.2 Test Retry

| Aspect | Selenium (Source) | Playwright (Target) |
|--------|-------------------|---------------------|
| Mechanism | `@Test(retryAnalyzer = RetryAnalyzer.class)` | `retries: 2` in `playwright.config.ts` |
| Max retries | 3 (`maxRetryCount = 3`) | Configurable per environment (`CI ? 2 : 0`) |
| Granularity | Per-test annotation | Global, per-project, or per-test via `test.describe.configure({ retries })` |
| State reset | Manual driver restart via `@AfterMethod` | Fresh `BrowserContext` per retry (isolated by default) |

### 5.3 Allure Reporting (`@Owner`, `@Description`)

| Aspect | Selenium (Source) | Playwright (Target) |
|--------|-------------------|---------------------|
| Owner | `@Owner("PRAMOD")` | Can be modeled as tag: `test('... @Owner:PRAMOD', ...)` or metadata in CustomTTAReporter |
| Description | `@Description("Verify that invalid creds give error message")` | `test.step('description', async () => { ... })` OR `test.describe` title |
| Report consumer | Allure HTML report | `CustomTTAReporter` HTML + built-in HTML reporter + JSON reporter |

### 5.4 Logging

| Aspect | Selenium (Source) | Playwright (Target) |
|--------|-------------------|---------------------|
| Framework | Log4j2 (`log4j2.xml`) | Custom `Logger.ts` (console-based) |
| Usage | `LogManager.getLogger(Class.class).info("...")` | `Logger.create('Context').info("...")` |
| Output | Console + `logs/test.log` file | Console (captured by CustomTTAReporter into HTML) |
| Step logging | Manual `logger.info()` | `logger.step(n, 'description')` + `test.step()` |

### 5.5 Config / Properties

| Aspect | Selenium (Source) | Playwright (Target) |
|--------|-------------------|---------------------|
| File | `data.properties` (key=value) | `.env` (secrets) + `vwo.config.ts` (typed config) + `vwo.json` (testdata) |
| Access | `PropertiesReader.readKey("url")` | `process.env.VWO_BASE_URL` or `vwoConfig.baseUrl` |
| Type safety | String-only, runtime errors | TypeScript interfaces (`VWOConfig`, `VWOUser`) |

### 5.6 Assertions

| Aspect | Selenium (Source) | Playwright (Target) |
|--------|-------------------|---------------------|
| Framework | TestNG `Assert` + AssertJ `assertThat` | Playwright `expect()` + `expect` from `@playwright/test` |
| Example | `Assert.assertEquals(error_msg, expected)` | `expect(errorMessage).toBe(expectedError)` |
| Web assertions | Manual WebDriver queries + assert | Playwright's auto-retrying web assertions (`toBeVisible`, `toHaveText`, etc.) |

---

## 6. Directory Structure for `PlaywrightMigratedFramework`

After migration, the VWO-specific subtree should look like this (merged into the existing `Advance-Playwright-Framework` skeleton):

```
PlaywrightMigratedFramework/
├── src/
│   ├── api/
│   │   └── vwo/
│   │       └── VWOAuthApi.ts              # (Optional) Phase 2
│   ├── config/
│   │   ├── index.ts                        # Existing
│   │   └── vwo.config.ts                   # NEW — Phase 1
│   ├── fixtures/
│   │   ├── index.ts                        # EXTEND — Phase 5
│   │   └── auth.fixture.ts                 # Existing
│   ├── modules/
│   │   ├── index.ts                        # EXTEND — Phase 4
│   │   └── vwo/
│   │       ├── VWOLoginModule.ts           # NEW — Phase 4
│   │       └── index.ts                    # NEW — Phase 4
│   ├── pages/
│   │   ├── index.ts                        # EXTEND — Phase 3
│   │   └── vwo/
│   │       ├── VWOLoginPage.ts             # NEW — Phase 3
│   │       ├── VWODashboardPage.ts         # NEW — Phase 3
│   │       └── index.ts                    # NEW — Phase 3
│   ├── testdata/
│   │   ├── types.ts                        # EXTEND — Phase 1
│   │   └── vwo.json                        # NEW — Phase 1
│   ├── tests/
│   │   └── vwo/
│   │       └── vwo-login-screenshot-retry.spec.ts   # NEW — Phase 6
│   └── utils/
│       └── WaitHelper.ts                   # REUSE (existing)
├── .env                                    # NEW — Phase 1
├── playwright.config.ts                    # EXTEND — Phase 7
├── package.json                            # Existing
└── tsconfig.json                           # Existing
```

---

## 7. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| VWO site DOM differs from Selenium selectors | High | Verify locators (`#login-username`, `#login-password`, `#js-login-btn`, `h6`) in a live Playwright session before coding Pages. |
| Playwright auto-waits make `WaitHelpers` redundant | Low | Do not port `WaitHelpers` blindly. Rely on Playwright's built-in waits; only use `WaitHelper.ts` for complex polling scenarios. |
| Retry + Screenshot parity not exact | Medium | Playwright retries create fresh contexts; screenshot behavior is superior but different. Document the difference in `README.md`. |
| Allure not natively supported | Low | The `CustomTTAReporter` provides HTML + JSON reports. If Allure is strictly required, add `allure-playwright` reporter later. |
| Module layer is new to Selenium devs | Low | Document the 3-layer rule (Pages -> Modules -> Tests) in framework onboarding docs. |

---

## 8. Acceptance Criteria for Migration Completion

- [ ] `src/tests/vwo/vwo-login-screenshot-retry.spec.ts` runs successfully in Chromium.
- [ ] On intentional failure, screenshot is automatically captured in `test-results/` and `tta-report/`.
- [ ] Failed tests are retried up to the configured retry count (2-3).
- [ ] `vwo.config.ts` loads all VWO properties without referencing `data.properties`.
- [ ] `VWOLoginModule.ts` encapsulates login workflow; test spec does not call page locators directly.
- [ ] Custom fixtures provide `vwoLoginPage`, `vwoDashboardPage`, and `vwoLoginModule`.
- [ ] No Java code remains in the VWO test path.
- [ ] `Logger` outputs structured logs visible in console and `CustomTTAReporter` HTML.

---

## 9. Summary Checklist

| Step | Action | Status |
|------|--------|--------|
| 1 | Analyze source & target frameworks | Done |
| 2 | Identify all Java files requiring TS equivalents | Done (18 source files mapped) |
| 3 | Identify new files needed for target architecture | Done (4 new files: Module, Fixture, Config, Testdata) |
| 4 | Define migration order (API -> Pages -> Modules -> Tests) | Done (7 phases) |
| 5 | Map cross-cutting concerns (screenshot, retry, logging, config) | Done |
| 6 | Define acceptance criteria | Done |
| 7 | **Generate Playwright code** | **NOT IN SCOPE** — Next step after plan approval |

---

---

## 10. CI/CD & DevOps Integration (Detailed)

### 10.1 Selenium Framework (Source)

**Status: NO dedicated CI/CD infrastructure exists.**

The Selenium framework is designed for **local execution only** with manual Maven triggers. There is no `Jenkinsfile`, no GitHub Actions workflows, no Docker configuration, and no containerization strategy.

**What exists:**
- `README.md` mentions **Selenoid Docker integration** as a future/cloud capability
- Manual Maven execution: `mvn test -Dsurefire.suiteXmlFiles=testng.xml`
- TestNG suite XMLs for manual test selection:
  - `testng_vwo_normal_part1.xml`
  - `testng_vwo_prop_part2.xml`
  - `testng_vwo_prop_improved_pom_part3.xml`
  - `testng_vwo_retry_prop_improved_pom_part4.xml`
  - `testng_vwo_takescreenshot_retry_prop_improved_pom_part5.xml`

**CI/CD Gap Analysis:**
| Capability | Available? | Gap |
|-----------|------------|-----|
| GitHub Actions | No | No automated PR checks, no branch protection testing |
| Jenkins Pipeline | No | No scheduled regression, no parameterized builds |
| Docker Containerization | No | Environment inconsistencies between local/CI |
| Test Sharding / Parallel Execution | No | TestNG parallel config is basic; no distributed execution |
| Artifact Archival | No | Screenshots and reports are local-only |
| Environment-Based Configuration | No | `data.properties` is static; no env-specific profiles |

### 10.2 Playwright Framework (Target)

**Status: FULL production-grade CI/CD stack.**

The target framework provides **three independent CI/CD pathways** plus full containerization.

#### A. GitHub Actions — Main Test Workflow
**File:** `.github/workflows/playwright.yml`

```yaml
name: Playwright Tests
on:
  push: { branches: [main, develop] }
  pull_request: { branches: [main, develop] }
  workflow_dispatch:
    inputs:
      test_tag: { description: 'Test tag to run (e.g., @Smoke, @P0, @Regression)' }
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]    # 4-way parallel sharding
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --shard=${{ matrix.shard }}/4
      - uses: actions/upload-artifact@v4
        with:
          name: playwright-report-shard-${{ matrix.shard }}
          path: [playwright-report/, test-results/, tta-report/]
  merge-reports:
    needs: test
    runs-on: ubuntu-latest
    if: always()
    steps:
      - run: npx playwright merge-reports --reporter html ./all-reports
```

**Key Features:**
- **4-way test sharding** — distributes tests across 4 parallel GitHub Actions runners
- **Merge reports** — combines all shard results into unified HTML report
- **Artifact upload** — preserves `playwright-report/`, `test-results/`, `tta-report/`
- **Manual dispatch** — supports tag-based test selection via `workflow_dispatch`

#### B. GitHub Actions — Smoke Tests
**File:** `.github/workflows/smoke-tests.yml`

```yaml
name: Smoke Tests
on:
  pull_request: { branches: [main, develop] }
jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --grep "@P0|@Smoke" --project=chromium
```

**Key Feature:** Fast PR gate — runs only `@P0` and `@Smoke` tagged tests on Chromium.

#### C. Jenkins Pipeline
**File:** `Jenkinsfile`

```groovy
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.40.0-jammy'
            args '-u root:root'
        }
    }
    environment {
        CI = 'true'
        NODE_ENV = 'test'
        BASE_URL = credentials('BASE_URL')
    }
    parameters {
        choice(name: 'TEST_TYPE', choices: ['smoke', 'regression', 'all'])
        string(name: 'TEST_TAG', defaultValue: '', description: 'Specific test tag')
        choice(name: 'BROWSER', choices: ['chromium', 'firefox', 'webkit', 'all'])
        string(name: 'SHARD_COUNT', defaultValue: '4')
    }
    stages {
        stage('Checkout') { steps { checkout scm } }
        stage('Install Dependencies') { steps { sh 'npm ci' } }
        stage('Lint Check') { steps { sh 'npm run lint || true' } }
        stage('TypeScript Build') { steps { sh 'npm run build' } }
        stage('Run Tests') {
            steps {
                script {
                    def testCommand = 'npx playwright test'
                    if (params.BROWSER != 'all') { testCommand += " --project=${params.BROWSER}" }
                    if (params.TEST_TYPE == 'smoke') { testCommand += ' --grep "@P0|@Smoke"' }
                    if (params.TEST_TAG?.trim()) { testCommand += " --grep \"${params.TEST_TAG}\"" }
                    if (params.SHARD_COUNT.toInteger() > 1) {
                        testCommand += " --shard=\$SHARD/\${params.SHARD_COUNT}"
                    }
                    sh testCommand
                }
            }
        }
    }
    post {
        always {
            publishHTML(target: [reportDir: 'playwright-report', reportFiles: 'index.html', reportName: 'Playwright Report'])
            publishHTML(target: [reportDir: 'tta-report', reportFiles: 'index.html', reportName: 'TTA Report'])
            archiveArtifacts artifacts: 'test-results/**/*'
            archiveArtifacts artifacts: 'tta-report/**/*'
            cleanWs()
        }
    }
}
```

**Key Features:**
- **Docker agent** — runs inside `mcr.microsoft.com/playwright:v1.40.0-jammy` for consistent environments
- **Parameterized builds** — `TEST_TYPE`, `TEST_TAG`, `BROWSER`, `SHARD_COUNT`
- **Credential injection** — `BASE_URL` from Jenkins credentials store
- **Multi-report publishing** — both Playwright HTML and Custom TTA Report
- **Artifact archival** — screenshots, videos, traces preserved in Jenkins
- **Workspace cleanup** — `cleanWs()` after execution

#### D. Dockerfile
**File:** `Dockerfile`

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy
WORKDIR /app
ENV CI=true
ENV NODE_ENV=test
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN mkdir -p /app/test-results /app/playwright-report /app/tta-report
CMD ["npx", "playwright", "test"]
```

#### E. Docker Compose (with Sharding)
**File:** `docker-compose.yml`

```yaml
version: '3.8'
services:
  shard-1:
    extends: { service: playwright-base }
    command: npx playwright test --shard=1/4 --reporter=list,json
  shard-2:
    extends: { service: playwright-base }
    command: npx playwright test --shard=2/4 --reporter=list,json
  shard-3:
    extends: { service: playwright-base }
    command: npx playwright test --shard=3/4 --reporter=list,json
  shard-4:
    extends: { service: playwright-base }
    command: npx playwright test --shard=4/4 --reporter=list,json
  smoke:
    extends: { service: playwright-base }
    command: npx playwright test --grep "@P0|@Smoke" --project=chromium
  merge-reports:
    command: npx playwright merge-reports --reporter html ./test-results
    depends_on:
      shard-1: { condition: service_completed_successfully }
```

### 10.3 Migration Strategy for CI/CD

| Source Gap | Target Solution | Migration Action |
|-----------|-----------------|------------------|
| No CI/CD | Full GitHub Actions + Jenkins + Docker | **Inherit** all target CI/CD files as-is |
| Manual Maven triggers | `npm test` + tagged scripts | Add `test:vwo`, `test:vwo:smoke`, `test:vwo:ci` to `package.json` |
| Static `data.properties` | Environment variables + `.env` | Create `.env` template; update `playwright.config.ts` with VWO `baseURL` |
| No test sharding | Native 4-way sharding | Configure shard matrix for VWO tests in CI workflows |
| No artifact archival | Auto artifact upload | VWO test artifacts automatically collected by existing workflows |

---

## 11. Bug Reporting & Failure Artifacts (Detailed)

### 11.1 Selenium Framework (Source)

**Bug reporting is entirely manual and limited to screenshot capture.**

**Mechanism 1: ScreenshotListener (Automatic on Failure)**
- Implements `ITestListener.onTestFailure(ITestResult)`
- Captures screenshot via `TakesScreenshot` interface
- Saves to `failure_screenshots/<methodName>_<timestamp>.png`
- Attaches to Allure report: `Allure.addAttachment("Screenshot", "image/png", ...)`
- Adds link to TestNG Reporter HTML: `org.testng.Reporter.log("<a href='...'>Screenshot</a>")`

**Mechanism 2: Manual Screenshot Utility**
- `TakeScreenShot.takeScreenshot(String name)` — called explicitly in tests
- Same file-saving and Allure attachment logic

**Limitations:**
- No video recording
- No browser console logs
- No network trace / HAR files
- No DOM snapshot at failure point
- No automatic bug ticket creation in JIRA / Azure DevOps / GitHub Issues
- Screenshots are local files; not centralized

### 11.2 Playwright Framework (Target)

**Bug reporting is artifact-driven with rich contextual data.**

**Configuration-Driven Artifacts (`playwright.config.ts`):**
```typescript
use: {
    screenshot: 'only-on-failure',     // Auto-screenshot on test failure
    video: 'retain-on-failure',        // Auto-video recording on failure
    trace: 'retain-on-failure',        // Auto-trace (DOM + network + console) on failure
}
```

**Artifact Types Captured Automatically:**

| Artifact | Selenium | Playwright | Value for Bug Reporting |
|----------|----------|------------|------------------------|
| Screenshot | Manual / Listener | `only-on-failure` auto | Visual evidence of UI state |
| Video | Not available | `retain-on-failure` auto | Reproduction of user journey leading to failure |
| Trace (DOM + Network + Console) | Not available | `retain-on-failure` auto | **Full interactive replay** via Playwright Trace Viewer |
| Console Logs | Not captured | Auto in trace | JavaScript errors, warnings |
| Network Logs | Not captured | Auto in trace | Failed API calls, 4xx/5xx responses |
| Storage State | Manual cookie dump | Auto in trace | Session/auth context at failure |

**CustomTTAReporter Enhancement:**
- Copies all artifacts from `test-results/` into `tta-report/screenshots/`, `videos/`, `traces/`
- Generates per-test artifact links in HTML report
- Provides modal lightbox for screenshot viewing
- Lists step-by-step execution with attached console logs

### 11.3 Bug Reporting Integration Strategy

**Option A: Manual Bug Creation (Immediate)**
Leverage the rich artifacts from CustomTTAReporter:
1. Tester opens `tta-report/index.html`
2. Clicks failed test → expands step details
3. Downloads screenshot + video + trace
4. Attaches to JIRA / GitHub Issue / Azure DevOps bug ticket manually

**Option B: Semi-Automated Bug Reporting (Recommended for Migration Phase 2)**
Create `src/utils/BugReporter.ts`:
```typescript
// Proposed integration (NOT in scope for Phase 1)
export class BugReporter {
    async createJiraBug(testInfo: TestInfo, artifactPaths: string[]): Promise<string> {
        // Uses JIRA REST API to create ticket
        // Attaches screenshot, video, trace as issue attachments
        // Returns JIRA issue key
    }
}
```

**Option C: MCP Server Integration (Future — AI-Driven)**
The `project_20_MCP_exercises/` folder in the repo contains MCP (Model Context Protocol) server examples including a `03_QA_dashboard_MCP.py`. This pattern can be extended to:
- Expose test failure data via MCP server
- Allow AI agents to read failure context and auto-generate bug descriptions

### 11.4 Migration Action for Bug Reporting

| Source | Target | Action |
|--------|--------|--------|
| `ScreenshotListener.java` (TestNG) | `playwright.config.ts` screenshot config | **Drop** listener; use built-in `screenshot: 'only-on-failure'` |
| `TakeScreenShot.java` (manual) | Playwright auto-capture + `page.screenshot()` | **Drop** utility; use `testInfo.attach()` or built-in capture |
| Allure attachment | CustomTTAReporter artifact copy | **Replace** — TTA reporter collects and organizes all artifacts |
| No video/trace | Native video + trace capture | **Gain** — zero-code artifact enrichment |

---

## 12. Jenkins Integration (Detailed)

### 12.1 Selenium Framework

**No Jenkins integration exists.** The framework would require a custom `Jenkinsfile` to be written from scratch, including:
- Maven installation and `pom.xml` resolution
- WebDriver binary management (ChromeDriver, GeckoDriver)
- Browser installation on Jenkins agents
- TestNG XML selection logic
- Allure report generation post-build

### 12.2 Playwright Framework

**Production-ready `Jenkinsfile` already exists** with the following Jenkins integrations:

**A. Pipeline Stages**
| Stage | Purpose |
|-------|---------|
| Checkout | SCM code checkout |
| Install Dependencies | `npm ci` (clean install) |
| Lint Check | `npm run lint` — code quality gate |
| TypeScript Build | `npm run build` — compilation check |
| Run Tests | Dynamic test command based on parameters |

**B. Build Parameters**
| Parameter | Type | Options | Usage |
|-----------|------|---------|-------|
| `TEST_TYPE` | choice | smoke, regression, all | Filters test scope |
| `TEST_TAG` | string | free text | Runs tests matching grep pattern |
| `BROWSER` | choice | chromium, firefox, webkit, all | Selects browser project |
| `SHARD_COUNT` | string | numeric | Parallel shard count |

**C. Jenkins Credentials Integration**
```groovy
environment {
    BASE_URL = credentials('BASE_URL')
}
```
- Sensitive URLs are **never hardcoded**
- Jenkins Credentials Plugin manages environment secrets

**D. Report Publishing**
```groovy
post {
    always {
        publishHTML(target: [reportDir: 'playwright-report', reportFiles: 'index.html', reportName: 'Playwright Report'])
        publishHTML(target: [reportDir: 'tta-report', reportFiles: 'index.html', reportName: 'TTA Report'])
        archiveArtifacts artifacts: 'test-results/**/*'
        archiveArtifacts artifacts: 'tta-report/**/*'
        cleanWs()
    }
}
```
- **Two HTML reports** published per build
- **Artifact archival** for offline analysis
- **Workspace cleanup** to prevent disk bloat

### 12.3 VWO Migration — Jenkins Adaptation

For the VWO test suite, the existing `Jenkinsfile` requires **zero changes** to execute VWO tests. Only these additions are recommended:

1. **Add VWO-specific credential:**
   ```groovy
   environment {
       BASE_URL = credentials('BASE_URL')
       VWO_BASE_URL = credentials('VWO_BASE_URL')  // NEW
       VWO_USERNAME = credentials('VWO_USERNAME')  // NEW
       VWO_PASSWORD = credentials('VWO_PASSWORD')  // NEW
   }
   ```

2. **Add VWO-specific pipeline parameter:**
   ```groovy
   parameters {
       choice(name: 'TEST_SUITE', choices: ['all', 'vwo', 'katalon', 'smoke'])
   }
   ```

3. **Add VWO-specific npm script:**
   ```json
   "test:vwo:ci": "playwright test --grep @VWO --project=chromium"
   ```

---

## 13. Assertions — Deep Dive & Migration Mapping

### 13.1 Selenium Framework Assertion Patterns

**Two assertion libraries are used in combination:**

#### A. TestNG Hard Assertions
**File:** `TestVWOLogin_02_Prop_POM.java`, `TestVWOLogin_03_Prop_Improved_POM.java`, `TestVWOLogin_05_TakeScreen_Retry_Prop_Improved_POM.java`

```java
import org.testng.Assert;

Assert.assertEquals(error_msg, PropertiesReader.readKey("error_message"));
Assert.assertEquals(usernameLoggedIn, PropertiesReader.readKey("expected_username"));
Assert.assertTrue(false);   // Intentional failure for retry test
Assert.assertTrue(true);    // Intentional pass for retry test
```

**Characteristics:**
- Hard assertions — test stops on first failure
- No auto-retry mechanism
- Requires manual element query before assertion
- No built-in waiting

#### B. AssertJ Fluent Assertions
**File:** `TestVWOLogin_03_Prop_Improved_POM.java`

```java
import static org.assertj.core.api.Assertions.assertThat;

assertThat(error_msg).isNotNull().isNotBlank().isNotEmpty();
assertThat(usernameLoggedIn).isNotBlank().isNotNull().isNotEmpty();
```

**Characteristics:**
- Fluent API chaining
- Rich error messages
- Still requires manual element query
- No web-first waiting

### 13.2 Playwright Framework Assertion Patterns

**Primary library:** Playwright `expect` from `@playwright/test` — **web-first, auto-retrying assertions.**

#### A. Web-First Assertions (Recommended)
**File:** `src/tests/katalon/tc001-full-happy-path.spec.ts`, `src/pages/LoginPage.ts`

```typescript
import { expect } from '@playwright/test';

// Visibility assertions
await expect(page.locator('#btn-make-appointment')).toBeVisible();
await expect(page.locator('#txt-username')).toBeVisible();

// URL assertions
await expect(page).toHaveURL(/profile\.php#login/);
await expect(page).toHaveTitle(/CURA Healthcare Service/);

// Text/content assertions
await expect(page.locator('#facility')).toHaveText('Tokyo CURA Healthcare Center');
await expect(page.locator('.lead')).toContainText('Please be informed...');

// Value assertions
await expect(page.locator('#txt-username')).toHaveValue(validUser.username);

// Attribute assertions
await expect(page.locator('#txt-password')).toHaveAttribute('type', 'password');

// State assertions
await expect(page.locator('#chk_hosp498')).not.toBeChecked();
await expect(page.locator('#radio_program_medicare')).toBeChecked();

// Element count
await expect(page.locator('.product-card')).toHaveCount(5);
```

**Key Advantage:** Playwright assertions **auto-retry** until the condition is met or a timeout is reached. This eliminates explicit `Thread.sleep()` and `WebDriverWait` calls.

#### B. Standard Jest-Style Assertions
**File:** `src/tests/login.spec.ts`, `src/tests/checkout.spec.ts`

```typescript
// String containment
expect(errorMessage).toContain(invalidUser.expectedError);

// Boolean
expect(result.success).toBe(true);

// Truthiness
expect(result.orderNumber).toBeTruthy();
expect(total).toBeTruthy();

// Numeric
expect(itemCount).toBeGreaterThan(0);
expect(loadTime).toBeLessThan(10000);

// URL (manual)
expect(page.url()).toContain('/home');
```

#### C. Inline Page Assertions
**File:** `src/pages/LoginPage.ts`

```typescript
export class LoginPage {
    async expectErrorVisible(): Promise<void> {
        await expect(this.errorMessage()).toBeVisible();
    }

    async expectErrorHidden(): Promise<void> {
        await expect(this.errorMessage()).toBeHidden();
    }

    async expectLoginButtonEnabled(): Promise<void> {
        await expect(this.loginButton()).toBeEnabled();
    }

    async expectOnLoginPage(): Promise<void> {
        await expect(this.page).toHaveURL(/.*login.*/);
    }
}
```

### 13.3 Assertion Migration Matrix

| Selenium (Java) | Playwright (TypeScript) | Notes |
|-----------------|------------------------|-------|
| `Assert.assertEquals(actual, expected)` | `expect(actual).toBe(expected)` | Direct mapping |
| `Assert.assertTrue(condition)` | `expect(condition).toBe(true)` | Direct mapping |
| `Assert.assertFalse(condition)` | `expect(condition).toBe(false)` | Direct mapping |
| `assertThat(text).isNotNull().isNotBlank()` | `expect(text).toBeTruthy()` | Simpler in Playwright |
| Manual wait + `getText()` + `assertEquals` | `await expect(locator).toHaveText('expected')` | **Eliminates explicit waits** |
| `WaitHelpers.visibilityOfElement(loc)` + `isDisplayed()` | `await expect(locator).toBeVisible()` | **One-line replacement** |
| `WaitHelpers.checkVisibility(driver, loc)` | `await expect(locator).toBeVisible()` | **No driver parameter needed** |
| `Assert.assertTrue(driver.findElement(loc).isEnabled())` | `await expect(locator).toBeEnabled()` | **Auto-retrying** |

### 13.4 VWO-Specific Assertion Migration

**Original Selenium assertions for VWO:**
```java
// Invalid login error message
assertThat(error_msg).isNotNull().isNotBlank().isNotEmpty();
Assert.assertEquals(error_msg, PropertiesReader.readKey("error_message"));

// Dashboard username
assertThat(usernameLoggedIn).isNotBlank().isNotNull().isNotEmpty();
Assert.assertEquals(usernameLoggedIn, PropertiesReader.readKey("expected_username"));
```

**Migrated Playwright assertions:**
```typescript
// In VWOLoginPage.ts (inline assertion)
async expectErrorMessage(expectedError: string): Promise<void> {
    await expect(this.errorMessage()).toHaveText(expectedError);
}

// In VWODashboardPage.ts (inline assertion)
async expectUsername(expectedUser: string): Promise<void> {
    await expect(this.userNameOnDashboard()).toHaveText(expectedUser);
}

// In test spec
await expect(errorMessage).toContain(expectedError);
await expect(loggedInUser).toBe(expectedUsername);
```

---

## 14. Test Data Management — Deep Dive & Migration Mapping

### 14.1 Selenium Framework Test Data

**Two data sources with different access patterns:**

#### A. Properties File (`data.properties`)
**File:** `src/main/resources/data.properties`

```properties
# VWO Application Data
url=https://app.vwo.com
username=hebiva4776@amcret.com
password=Test@4321
expected_username=Amcret
invalid_username=admin@admin.com
invalid_password=Test@2024
error_message=Your email, password, IP address or location did not match
invalid_error_message=Pramod email, password, IP address or location did not match
browser=chrome

# Orange HRM Data
ohr_username=admin
ohr_password=Hacker@4321
ohr_expected_username=PIM
ohr_url=https://awesomeqa.com/hr/web/index.php/auth/login

# Katalon App Data
katalon_url=https://katalon-demo-cura.herokuapp.com/

# iDrive App Data
idrive_url=https://www.idrive360.com/enterprise/login

# Iffy App Data
iffy_url=https://iffy.com/sign-up
```

**Access Pattern:**
```java
String url = PropertiesReader.readKey("url");
String username = PropertiesReader.readKey("username");
```

**Problems:**
- All values are **strings** — no type safety
- **No separation** of secrets vs. non-secrets
- **Single file** for all applications — merge conflicts likely
- **No array/list support** — complex data structures require parsing
- Runtime errors if key is misspelled

#### B. Excel File (`TestData.xlsx`)
**File:** `src/test/resources/TestData.xlsx`

**Reader Utility:**
```java
// UtilExcel.java
public static Object[][] getTestDataFromExcel(String sheetName) {
    Workbook workbook = WorkbookFactory.create(new FileInputStream(SHEET_PATH));
    Sheet sheet = workbook.getSheet(sheetName);
    Object[][] data = new Object[sheet.getLastRowNum()][sheet.getRow(0).getLastCellNum()];
    // ... cell iteration
    return data;
}
```

**Usage with TestNG DataProvider:**
```java
@DataProvider
public Object[][] getData() {
    return UtilExcel.getTestDataFromExcel("sheet1");
}

@Test(dataProvider = "getData")
public void test_vwo_login(String email, String password) {
    // Data-driven test execution
}
```

**Problems:**
- Binary file — **not diff-friendly** in version control
- Requires **Apache POI dependency** (heavy library)
- **No schema validation** — column order changes break tests
- **No IDE autocomplete** — cell references are strings

### 14.2 Playwright Framework Test Data

**Three typed data sources with full TypeScript support:**

#### A. JSON Test Data Files
**File:** `src/testdata/users.json`

```json
{
    "validUsers": [
        {
            "id": "user-001",
            "username": "testuser@example.com",
            "password": "SecurePass123",
            "firstName": "Test",
            "lastName": "User",
            "role": "customer"
        }
    ],
    "invalidUsers": [
        {
            "username": "invalid@example.com",
            "password": "wrongpassword",
            "expectedError": "Invalid credentials"
        },
        {
            "username": "",
            "password": "somepassword",
            "expectedError": "Username is required"
        }
    ],
    "lockedUser": {
        "username": "locked@example.com",
        "password": "LockedPass123",
        "expectedError": "Account is locked"
    }
}
```

**File:** `src/testdata/products.json`

```json
{
    "products": [
        {
            "id": "prod-001",
            "name": "Wireless Bluetooth Headphones",
            "price": 149.99,
            "stock": 50,
            "sizes": [],
            "colors": ["Black", "White", "Blue"]
        }
    ],
    "outOfStockProduct": {
        "id": "prod-oos",
        "name": "Limited Edition Watch",
        "stock": 0
    },
    "promoCodes": [
        {
            "code": "SAVE10",
            "discount": 10,
            "type": "percentage",
            "minOrder": 50
        }
    ]
}
```

#### B. TypeScript Interfaces (`types.ts`)
**File:** `src/testdata/types.ts`

```typescript
export interface ValidUser {
    id: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface InvalidUser {
    username: string;
    password: string;
    expectedError: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    rating: number;
    sizes?: string[];
    colors?: string[];
}

export interface PromoCode {
    code: string;
    discount: number;
    type: string;
    minOrder: number;
    expired?: boolean;
}
```

**Usage in Tests:**
```typescript
import usersData from '../testdata/users.json';
import { UsersData, InvalidUser } from '../testdata/types';

const typedUsersData = usersData as UsersData;
const validUser = typedUsersData.validUsers[0];
const invalidUsers: InvalidUser[] = typedUsersData.invalidUsers;
```

**Advantages:**
- **Compile-time type checking** — IDE autocomplete and error detection
- **Schema enforcement** — TypeScript ensures data shape
- **Diff-friendly** — JSON is text-based version control friendly
- **No external dependencies** — native JSON.parse()

#### C. Config-Driven Test Data
**File:** `src/config/index.ts`

```typescript
export const testData = {
    validCreditCard: {
        number: '4111111111111111',
        expiry: '12/25',
        cvc: '123',
        holder: 'Test User',
    },
    invalidCreditCard: {
        number: '4111111111111112',
        expiry: '12/20',
        cvc: '999',
        holder: 'Invalid User',
    },
    addresses: {
        us: { street: '123 Main Street', city: 'New York', state: 'NY', zip: '10001', country: 'US' },
        uk: { street: '10 Downing Street', city: 'London', state: '', zip: 'SW1A 2AA', country: 'GB' },
    },
};
```

#### D. Environment Variables (`.env`)
**File:** `.env` (gitignored)

```bash
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
TEST_USERNAME=testuser@example.com
TEST_PASSWORD=SecurePass123
LOG_LEVEL=INFO
RETRY_COUNT=3
```

**Access:**
```typescript
import { config } from '../config';
const username = config.testUser.username;
```

### 14.3 Test Data Migration Matrix

| Source (Selenium) | Target (Playwright) | Migration Action |
|-------------------|---------------------|------------------|
| `data.properties` — flat key=value | `.env` + `src/config/vwo.config.ts` + `src/testdata/vwo.json` | **Split** secrets to `.env`, structured data to JSON, typed config to TS |
| `TestData.xlsx` — binary Excel | `src/testdata/vwo.json` + `src/testdata/types.ts` | **Replace** with JSON + TypeScript interfaces |
| `PropertiesReader.readKey("url")` | `process.env.VWO_BASE_URL` or `vwoConfig.baseUrl` | **Replace** with typed config access |
| `UtilExcel.getTestDataFromExcel("sheet1")` | `import vwoData from '../testdata/vwo.json'` | **Replace** with JSON import |
| String-only values | Typed interfaces (`string`, `number`, `boolean`, arrays) | **Gain** compile-time safety |
| Runtime key errors | TypeScript IntelliSense + compile errors | **Gain** early error detection |

### 14.4 Proposed VWO Test Data Structure

**File:** `src/testdata/vwo.json`
```json
{
    "validUser": {
        "username": "hebiva4776@amcret.com",
        "password": "Test@4321",
        "expectedUsername": "Amcret"
    },
    "invalidUser": {
        "username": "admin@admin.com",
        "password": "Test@2024",
        "expectedError": "Your email, password, IP address or location did not match"
    },
    "emptyFieldUsers": [
        { "username": "", "password": "Test@4321", "expectedError": "Username is required" },
        { "username": "admin@admin.com", "password": "", "expectedError": "Password is required" }
    ]
}
```

**File:** `src/testdata/types.ts` (extend existing)
```typescript
export interface VWOUser {
    username: string;
    password: string;
    expectedUsername?: string;
    expectedError?: string;
}

export interface VWOTestData {
    validUser: VWOUser;
    invalidUser: VWOUser;
    emptyFieldUsers: VWOUser[];
}
```

---

## 15. AI Tools, Agents & Automation Ecosystem (Detailed)

### 15.1 Selenium Framework

**Status: NO AI tooling or agent infrastructure.**

The framework is a traditional manual-coding test automation framework. A copied folder `project_20_MCP_exercises/` exists containing MCP (Model Context Protocol) server exercises, but these are **not integrated** into the framework.

**MCP Exercises (Reference Only):**
- `src/01_helloworldcalculator.py` — Basic MCP server
- `src/02_Weather_MCP.py` — Weather API MCP
- `src/03_QA_dashboard_MCP.py` — QA dashboard MCP
- `src/04_QA_dashboard_dynamic_data.py` — Dynamic data MCP
- `MCP_INSPECTOR_SETUP.md` — Inspector setup guide

### 15.2 Playwright Framework — Comprehensive AI Ecosystem

The target framework has an **enterprise-grade AI agent ecosystem** with 6 integrated components:

#### A. GitHub Copilot Instructions
**File:** `.github/copilot-instructions.md`

Defines coding standards for AI-assisted development:
- **3-layer architecture enforcement:** Pages -> Modules -> Tests
- **Arrow-function locators mandate:** `usernameInput = () => this.page.locator('#username')`
- **Path alias requirement:** `@pages/`, `@modules/`, `@utils/`, `@fixtures/`
- **Test structure rules:** `test.describe()` with tags, `test.step()` for every logical step
- **Anti-patterns prohibited:** No `console.log`, no hardcoded waits, no direct locator access in modules

#### B. AI Agent Instructions (Planner / Healer / Generator)
**Files:**
- `.github/instructions/planner.instructions.md`
- `.github/instructions/healer.instructions.md`
- `.github/instructions/generator.instructions.md`

**Planner Agent — Test Design:**
```markdown
## Mandatory Output
1. Feature Summary
2. Scenario Matrix (positive, negative, edge cases)
3. Data Needed
4. Test Tags (@P0/@P1/@P2, @Smoke/@Regression)
5. Impacted Files
```

**Healer Agent — Test Repair:**
```markdown
## Repair Strategy
1. Identify failure root cause.
2. Patch only affected files.
3. Preserve Pages -> Modules -> Tests boundaries.
4. Avoid broad refactors.

## Completion Criteria
1. Failure is resolved.
2. npm run rules:check passes.
3. No unrelated files changed.
```

**Generator Agent — Code Generation:**
- Receives planner output
- Generates code only in approved folders
- Follows path aliases and naming conventions
- Runs `npm run rules:check` before declaring completion

#### C. IDE AI Rules (Cursor / Windsurf / Augment)

**Cursor Rules (` .cursorrules `):**
- 97 lines enforcing architecture layers
- Arrow-function locators mandate
- TypeScript strict mode requirements
- File naming conventions (`*Page.ts`, `*Module.ts`, `*.spec.ts`)
- Path alias enforcement

**Windsurf Rules (` .windsurfrules `):**
```yaml
project_type: playwright-test-framework
layers:
  pages: src/pages/*.ts
  modules: src/modules/*.ts
  tests: src/tests/**/*.spec.ts
code_generation:
  locators: arrow_functions
  assertions: playwright_expect
  waits: auto_wait_only
```

**Augment Code Rules (` .augment/rules/ `):**
- `code-standards.md` — ESLint rules, commit message format (`feat(scope): description`)
- `framework-rules.md` — Page/Module/Test templates, path aliases, common mistakes

#### D. Rule Engine (Automated Enforcement)
**Config:** `rules/framework-rule-engine.json`
**Script:** `scripts/rule-engine.js`

Enforces via automated regex scanning:
| Rule | Enforcement |
|------|-------------|
| Page files location | Must be under `src/pages/` |
| Module files location | Must be under `src/modules/` |
| Arrow-function locators | `*Page.ts` must contain `= () => this.page.locator(` |
| No direct locators in modules | `*Module.ts` must NOT contain `.locator(` |
| Test structure | `*.spec.ts` must use `test.describe()` and `test.step()` |
| Test tags | Must contain `@P0`, `@P1`, `@P2`, `@Smoke`, or `@Regression` |
| No console.log | Framework code must not contain `console.log` |

**npm Scripts:**
```json
"rules:check": "node scripts/rule-engine.js",
"rules:changed": "node scripts/rule-engine.js --changed",
"rules:staged": "node scripts/rule-engine.js --staged",
"agents:init": "npx playwright init-agents"
```

#### E. Skill Definition (MCP Tutor)
**File:** `skills/playwright-ai-mcp-tutor/SKILL.md`

Defines the core AI workflow:
```markdown
## Core Workflow
1. Read architecture constraints from references/rules.md.
2. Ask Planner to output scenarios, tags, and impacted files only.
3. Ask Generator to write code only in approved folders.
4. Run npm run rules:check and relevant tests.
5. If failing, ask Healer to patch minimal code using logs/traces.
```

#### F. Documentation & Teaching Materials
**Folder:** `docs/ai-agents/`

| Document | Purpose |
|----------|---------|
| `index.mdx` | Tutor pack overview |
| `planner-healer-generator.mdx` | Agent operating contracts and prompt templates |
| `mcp-without-hallucination.mdx` | MCP server setup for deterministic browser grounding |
| `rule-engine.mdx` | Rule engine documentation |
| `skills-and-prompts.mdx` | Prompt library for AI interactions |
| `10-slide-class-deck.mdx` | Teaching deck for framework onboarding |
| `class-plan.mdx` | Class curriculum for learning the framework |

### 15.3 AI Ecosystem Migration Strategy

| Component | Selenium | Playwright | Migration Action |
|-----------|----------|------------|------------------|
| AI Coding Assistant | None | Copilot + Cursor + Windsurf + Augment | **Inherit** all target IDE configurations |
| Test Design Agent | None | Planner agent | **Inherit** `.github/instructions/planner.instructions.md` |
| Self-Healing Agent | None | Healer agent | **Inherit** `.github/instructions/healer.instructions.md` |
| Code Generator Agent | None | Generator agent | **Inherit** `.github/instructions/generator.instructions.md` |
| Architecture Enforcement | None | Rule engine (`scripts/rule-engine.js`) | **Inherit** and extend for VWO patterns |
| MCP Integration | Reference exercises only | `skills/playwright-ai-mcp-tutor/` | **Inherit** and customize for VWO domain |

### 15.4 Recommended VWO-Specific AI Additions

For the migrated VWO test suite, these AI customizations are recommended:

1. **Extend `.cursorrules`** with VWO-specific locator patterns:
   ```
   # VWO-specific rules
   - VWO login locators must use id selectors: #login-username, #login-password
   - VWO dashboard assertions must verify h6 text content
   ```

2. **Extend rule engine** to validate VWO page structure:
   ```json
   {
     "rule": "vwo-page-naming",
     "pattern": "src/pages/vwo/VWO*.ts",
     "require": "extends BasePage OR contains constructor(page: Page)"
   }
   ```

3. **Add VWO prompts to `docs/ai-agents/skills-and-prompts.mdx`**:
   - Prompt template for generating VWO login test scenarios
   - Prompt template for healing VWO flakiness

---

## 16. Complete Cross-Framework Comparison Matrix

| Dimension | Selenium (Source) | Playwright (Target) | Migration Impact |
|-----------|-------------------|---------------------|------------------|
| **Language** | Java 17 | TypeScript 5.9 | Full rewrite required |
| **Test Runner** | TestNG 7.11 | Playwright Test 1.57 | Paradigm shift (annotations -> fixtures) |
| **Browser Control** | Static WebDriver singleton | Isolated BrowserContext per test | Automatic isolation (no ThreadLocal needed) |
| **Locator Strategy** | `By.id()`, `By.xpath()` | `page.locator()` with auto-wait | More resilient, less boilerplate |
| **Waits** | Explicit `WebDriverWait`, `Thread.sleep` | Auto-wait + `WaitHelper.ts` | Eliminate 80% of wait code |
| **Assertions** | TestNG Assert + AssertJ | Playwright `expect()` web-first | Gain auto-retry, lose AssertJ chaining |
| **Test Data** | `.properties` + Excel | JSON + TS interfaces + `.env` | Type safety + version control friendly |
| **Screenshot** | Manual listener | Config-driven auto-capture | Zero-code screenshot on failure |
| **Video** | Not available | Auto on failure | New capability |
| **Trace** | Not available | Auto on failure | New capability (interactive replay) |
| **Retry** | TestNG `IRetryAnalyzer` | Config `retries` | Simpler, per-context fresh |
| **Reporting** | Allure + ReportNG + Log4j2 | CustomTTAReporter + HTML + JSON | Richer real-time reporting |
| **CI/CD** | None | GitHub Actions + Jenkins + Docker | Full production pipeline |
| **Test Sharding** | None | Native 4-way sharding | Scalable parallel execution |
| **Bug Reporting** | Manual screenshot | Artifact-rich failure context | Screenshots + video + trace |
| **AI Agents** | None | Planner + Healer + Generator | Automated design, healing, generation |
| **Rule Enforcement** | None | Automated rule engine | Architecture guardrails |
| **IDE AI Rules** | None | Cursor + Windsurf + Augment | AI-assisted coding standards |

---

## 17. Updated Acceptance Criteria (Including New Dimensions)

### Core Test Migration
- [ ] `src/tests/vwo/vwo-login-screenshot-retry.spec.ts` runs successfully in Chromium.
- [ ] On intentional failure, screenshot is automatically captured in `test-results/` and `tta-report/`.
- [ ] Failed tests are retried up to the configured retry count (2-3).
- [ ] `vwo.config.ts` loads all VWO properties without referencing `data.properties`.
- [ ] `VWOLoginModule.ts` encapsulates login workflow; test spec does not call page locators directly.
- [ ] Custom fixtures provide `vwoLoginPage`, `vwoDashboardPage`, and `vwoLoginModule`.
- [ ] No Java code remains in the VWO test path.
- [ ] `Logger` outputs structured logs visible in console and `CustomTTAReporter` HTML.

### CI/CD & DevOps
- [ ] `npm run test:vwo` executes successfully locally.
- [ ] GitHub Actions smoke workflow passes for `@VWO @Smoke` tagged tests.
- [ ] Jenkins parameterized build can execute VWO tests with `TEST_TAG=@VWO`.
- [ ] Docker image builds successfully: `docker build -t playwright-vwo .`

### Test Data & Assertions
- [ ] `src/testdata/vwo.json` contains all VWO test data with TypeScript types.
- [ ] No Excel or `.properties` files are used for VWO test data.
- [ ] All assertions use Playwright `expect()` with web-first matchers.
- [ ] No explicit `WaitHelper` calls needed for standard element interactions.

### AI & Automation Ecosystem
- [ ] `npm run rules:check` passes for all new VWO files.
- [ ] VWO pages use arrow-function locators.
- [ ] VWO modules do not contain `.locator(` calls.
- [ ] VWO tests use `test.describe()` with `@P0/@P1/@P2/@Smoke/@Regression` tags.
- [ ] VWO tests use `test.step()` for every logical step.

---

*Plan prepared for: `TestVWOLogin_05_TakeScreen_Retry_Prop_Improved_POM.java`*  
*Target: `PlaywrightMigratedFramework` following `Advance-Playwright-Framework` architecture*
