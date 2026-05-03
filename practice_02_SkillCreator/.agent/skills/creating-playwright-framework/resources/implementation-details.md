# Playwright Framework Implementation Details

## Error Handling & Assertions
Use soft assertions for non-critical checks to prevent early test termination:
```typescript
await expect.soft(page.locator('text=success')).toBeVisible();
```

Implement a global error handler in `playwright.config.ts`:
```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
}
```

## Mobile Emulation
Define projects for mobile specific testing:
```typescript
{
  name: 'Mobile Safari',
  use: { ...devices['iPhone 13'] },
},
```

## API Request Context
Standardize API calls using a dedicated helper class to ensure consistent error handling for status codes.
