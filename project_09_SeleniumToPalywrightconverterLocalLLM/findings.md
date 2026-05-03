# Findings
## Research
- (Pending Phase 1)

## Discoveries
- (None yet)

## Constraints
- **Input**: Java (TestNG based)
- **Output**: TypeScript (Playwright Test)
- **UI**: Must be user-friendly, dual-pane (Source vs Result).
- **Backend**: Python (as per BLAST protocol).

## Conversion Logic (Preliminary)
- **Imports**: Remove `org.openqa.selenium.*`, add `@playwright/test`.
- **Class Structure**: TestNG classes usually map to a file or a `test.describe` block.
- **Test Methods**: `@Test` -> `test('...', async ({ page }) => { ... })`.
- **Locators**:
  - `By.id` -> `#`
  - `By.cssSelector` -> css selector
  - `By.xpath` -> xpath
- **Actions**:
  - `.click()` -> `.click()`
  - `.sendKeys(...)` -> `.fill(...)`
