# 💎 Gemini - Selenium Framework Constitution

## 🗺️ Project Map
- **Project Name:** Blast Selenium Enterprise Framework
- **Protocol:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger)
- **Architecture:** A.N.T. (Architecture, Navigation, Tools)

## 📊 Data Schemas (The Payload Shape)

### 1. Configuration Schema (`config.properties`)
```properties
browser=chrome
headless=false
url=https://example.com
timeout=10
```

### 2. Test Data Schema (`data.yaml`)
```yaml
test_cases:
  - id: TC001
    description: "Verify login functionality"
    input_data:
      username: "test_user"
      password: "password123"
    expected_result: "Dashboard displayed"
```

## 📜 Behavioral Rules
1. **Deterministic Logic:** No "sleep" commands; use Explicit Waits only.
2. **Atomic Tools:** Every tool in `tools/` must perform exactly one function.
3. **Data Isolation:** Hardcoded strings in tests are forbidden. All data must come from YAML or Properties.
4. **Self-Healing:** Framework must capture screenshots and logs on failure.

## 🏗️ Architectural Invariants
- **Layer 1 (Architecture):** All markdown SOPs in `architecture/`.
- **Layer 3 (Tools):** All execution scripts (Java/Python) in `tools/` or a dedicated source folder.

## 🛠️ Maintenance Log
- [2026-02-22] Project Initialized - Selenium Framework.
