# Project Constitution (Gemini)

## 1. Data Schemas

### Type: `ConversionRequest`
- **Source**: User Input (UI)
- **Format**: JSON
- **Fields**:
  - `source_code`: string (The Selenium Java code)
  - `output_format`: string (Fixed: "playwright-ts")
  - `project_name`: string (Optional, for directory naming)

### Type: `ConversionResult`
- **Destination**: UI Display & Local File System
- **Format**: JSON
- **Fields**:
  - `success`: boolean
  - `converted_code`: string (The Playwright TS code)
  - `file_path`: string (Absolute path where file was saved)
  - `logs`: list[string] (Conversion notes/warnings)

## 2. Behavioral Rules
- **Readability First**: Do not do a strict line-by-line translation if it results in messy code. Use Playwright best practices (e.g., auto-waiting over explicit waits).
- **Language Target**: Output MUST be **TypeScript** (Playwright Test).
- **Framework Mapping**:
  - `TestNG @Test` -> `test('name', async ({ page }) => { ... })`
  - `driver.findElement(By.id("..."))` -> `page.locator('#...')`
  - `assertEquals` -> `expect(...).toHave...`

## 3. Architectural Invariants
- **Frontend**: Simple Web UI (HTML/CSS/JS).
- **Backend / Tools**: Python scripts in `tools/` wrapping Ollama API.
- **AI Engine**: **Ollama** running locally (port 11434).
- **Model**: `codellama` (Strict requirement).
- **Communication Flow**: UI -> FastAPI -> Python Client -> Ollama -> Playwright Code.
- **Directory Structure**:
  - `ui/`: Frontend assets
  - `converted_output/`: Default destination for converted files
  - `tools/`: Python conversion logic (now powered by LLM)

## 4. Maintenance Log

### 2026-01-31: Initial Release (v1.0)
- **Architecture**: Local LLM (Ollama/CodeLlama) + Python FastAPI + HTML/JS UI.
- **Key Files**:
    - `tools/server.py`: Main entry point for logic.
    - `tools/llm_client.py`: API wrapper for Ollama.
    - `ui/`: Frontend source.
- **Troubleshooting**:
    - **Error "Connection refused"**: Ensure "Ollama" app is running.
    - **Error "Model not found"**: Run `ollama pull codellama`.

